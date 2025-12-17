import React, { useState, useEffect, useRef, useCallback } from 'react';
import { GameState, ActiveFish, HookPosition, CatchResult, FishType, UpgradeState } from './types';
import { FISH_TYPES, GAME_CONFIG, ROD_UPGRADES, REEL_UPGRADES } from './constants';
import Ocean from './components/Ocean';
import Controls from './components/Controls';
import Modal from './components/Modal';
import Shop from './components/Shop';
import { analyzeCatch } from './services/geminiService';
import { audioService } from './services/audioService';

const SAVE_KEY = 'gemini_reel_master_save_v1';

const App: React.FC = () => {
  // --- Helper: Load State ---
  const loadFromStorage = <T,>(key: string, defaultValue: T): T => {
    try {
      const raw = localStorage.getItem(SAVE_KEY);
      if (raw) {
        const data = JSON.parse(raw);
        return data[key] !== undefined ? data[key] : defaultValue;
      }
    } catch (e) {
      console.warn("Failed to load save data", e);
    }
    return defaultValue;
  };

  // --- State ---
  const [gameState, setGameState] = useState<GameState>(GameState.IDLE);
  const [activeFish, setActiveFish] = useState<ActiveFish[]>([]);
  const [hookPosition, setHookPosition] = useState<HookPosition>({ x: 50, y: -10 });
  const [tension, setTension] = useState<number>(0); // 0 to 100
  const [catchResult, setCatchResult] = useState<CatchResult | null>(null);
  
  // Persisted State (Lazy init from storage)
  const [score, setScore] = useState<number>(() => loadFromStorage('score', 0));
  const [inventory, setInventory] = useState<Record<string, number>>(() => loadFromStorage('inventory', {}));
  const [upgradeState, setUpgradeState] = useState<UpgradeState>(() => {
    const saved = loadFromStorage('upgradeState', { rodLevel: 0, reelLevel: 0 });
    // Safety: Ensure levels are within valid bounds to prevent crashes
    return {
      rodLevel: Math.max(0, Math.min(saved.rodLevel || 0, ROD_UPGRADES.length - 1)),
      reelLevel: Math.max(0, Math.min(saved.reelLevel || 0, REEL_UPGRADES.length - 1))
    };
  });
  
  const [showShop, setShowShop] = useState(false);
  const [isAiLoading, setIsAiLoading] = useState(false);
  const [showHelp, setShowHelp] = useState(true);

  // --- Refs for Game Loop ---
  const gameLoopRef = useRef<number>();
  const lastTimeRef = useRef<number>(0);
  const hookRef = useRef<HookPosition>({ x: 50, y: -10 });
  const fishRef = useRef<ActiveFish[]>([]);
  const isReelingRef = useRef<boolean>(false);
  const hookedFishRef = useRef<ActiveFish | null>(null);
  const tensionRef = useRef<number>(0);
  const reelSoundThrottleRef = useRef<number>(0); 

  // --- Auto Save Effect ---
  useEffect(() => {
    const saveData = {
      score,
      inventory,
      upgradeState
    };
    localStorage.setItem(SAVE_KEY, JSON.stringify(saveData));
  }, [score, inventory, upgradeState]);

  // --- Helpers ---
  const spawnFish = () => {
    if (fishRef.current.length >= 8) return;

    // Weighted Random Spawn Logic based on Rod Level
    const currentRodTier = ROD_UPGRADES[upgradeState.rodLevel] || ROD_UPGRADES[0];
    const rodEffect = currentRodTier.effectValue;
    
    // Calculate total weight
    const weightedTypes = FISH_TYPES.map(fish => {
        let weight = 0;
        if (fish.rarity === 'Common') weight = 100;
        if (fish.rarity === 'Rare') weight = 20 + rodEffect; // Rod boosts rare chance
        if (fish.rarity === 'Legendary') weight = 5 + (rodEffect * 0.5); // Rod boosts legendary chance slightly less
        return { fish, weight };
    });

    const totalWeight = weightedTypes.reduce((acc, item) => acc + item.weight, 0);
    let random = Math.random() * totalWeight;
    let selectedType = FISH_TYPES[0];

    for (const item of weightedTypes) {
        if (random < item.weight) {
            selectedType = item.fish;
            break;
        }
        random -= item.weight;
    }

    const direction = Math.random() > 0.5 ? 1 : -1;
    const spawnY = (selectedType.depth * 90) + (Math.random() * 5); 
    
    const newFish: ActiveFish = {
      id: Date.now() + Math.random(),
      typeId: selectedType.id,
      x: direction === 1 ? -10 : 110,
      y: spawnY,
      direction,
      speedMultiplier: 0.8 + Math.random() * 0.4,
    };
    fishRef.current.push(newFish);
  };

  // --- Game Loop ---
  const update = useCallback((time: number) => {
    if (!lastTimeRef.current) lastTimeRef.current = time;
    const deltaTime = (time - lastTimeRef.current) / 16; 
    lastTimeRef.current = time;

    // 1. Update Fish Movement
    fishRef.current = fishRef.current
      .map(fish => {
        if (hookedFishRef.current && hookedFishRef.current.id === fish.id) return fish;

        const type = FISH_TYPES.find(f => f.id === fish.typeId);
        if (!type) return fish;
        
        let newX = fish.x + (type.speed * fish.speedMultiplier * fish.direction * 0.2 * deltaTime);
        
        if ((fish.direction === 1 && newX > 120) || (fish.direction === -1 && newX < -20)) {
          return null; 
        }
        return { ...fish, x: newX };
      })
      .filter(Boolean) as ActiveFish[];

    if (Math.random() < 0.01) spawnFish();

    // 2. State Machine Physics
    switch (gameState) {
      case GameState.CASTING:
        setGameState(GameState.SINKING);
        break;

      case GameState.SINKING:
        hookRef.current.y += GAME_CONFIG.GRAVITY * deltaTime;
        if (hookRef.current.y > 95) {
            setGameState(GameState.IDLE);
            hookRef.current = { x: 50, y: -10 };
            tensionRef.current = 0;
        }

        if (!hookedFishRef.current) {
            const hitFish = fishRef.current.find(fish => {
                const dx = Math.abs(fish.x - hookRef.current.x);
                const dy = Math.abs(fish.y - hookRef.current.y);
                return dx < 5 && dy < 5;
            });

            if (hitFish) {
                hookedFishRef.current = hitFish;
                setGameState(GameState.HOOKED);
                tensionRef.current = 30; 
                audioService.playBite();
            }
        }
        break;

      case GameState.HOOKED:
      case GameState.REELING:
        if (!hookedFishRef.current) {
            setGameState(GameState.LOST);
            return;
        }

        const currentFish = hookedFishRef.current;
        const fishType = FISH_TYPES.find(f => f.id === currentFish.typeId);
        
        if (isReelingRef.current) {
            const currentReelTier = REEL_UPGRADES[upgradeState.reelLevel] || REEL_UPGRADES[0];
            const reelMultiplier = currentReelTier.effectValue;
            const effectivePower = GAME_CONFIG.REEL_POWER * reelMultiplier;

            hookRef.current.y -= effectivePower * 0.065 * deltaTime;
            tensionRef.current += GAME_CONFIG.TENSION_INCREASE * deltaTime;
            
            reelSoundThrottleRef.current += deltaTime;
            if (reelSoundThrottleRef.current > 5) { 
                audioService.playReel();
                reelSoundThrottleRef.current = 0;
            }

        } else {
            hookRef.current.y += (fishType?.speed || 0.5) * 0.06 * deltaTime;
            tensionRef.current -= GAME_CONFIG.TENSION_DECREASE * deltaTime;
        }

        tensionRef.current = Math.max(0, Math.min(100, tensionRef.current));

        currentFish.x = hookRef.current.x;
        currentFish.y = hookRef.current.y;
        
        fishRef.current = fishRef.current.map(f => f.id === currentFish.id ? currentFish : f);

        if (tensionRef.current >= 100) {
            setGameState(GameState.LOST);
            hookedFishRef.current = null;
            audioService.playLost();
        } else if (tensionRef.current <= 0) {
             setGameState(GameState.LOST);
             hookedFishRef.current = null;
             audioService.playLost();
        } else if (hookRef.current.y <= 0) {
            setGameState(GameState.CAUGHT);
            audioService.playCatch();
        }
        break;
        
      case GameState.LOST:
          hookRef.current.y -= 2 * deltaTime;
          if (hookRef.current.y < -10) {
              setGameState(GameState.IDLE);
              hookRef.current = { x: 50, y: -10 };
          }
          break;
    }

    let displayX = hookRef.current.x;
    let displayY = hookRef.current.y;
    
    if (gameState === GameState.HOOKED || gameState === GameState.REELING) {
        const shakeIntensity = 0.3 + (tensionRef.current / 80); 
        displayX += (Math.random() - 0.5) * shakeIntensity;
        displayY += (Math.random() - 0.5) * shakeIntensity;
    }

    setHookPosition({ x: displayX, y: displayY });
    setActiveFish([...fishRef.current]);
    setTension(tensionRef.current);

    gameLoopRef.current = requestAnimationFrame(update);
  }, [gameState, upgradeState]); 

  // --- Lifecycle ---
  useEffect(() => {
    gameLoopRef.current = requestAnimationFrame(update);
    return () => {
      if (gameLoopRef.current) cancelAnimationFrame(gameLoopRef.current);
    };
  }, [update]);

  // Handle Catch Event Effect
  useEffect(() => {
    if (gameState === GameState.CAUGHT && hookedFishRef.current) {
      const fishDef = FISH_TYPES.find(f => f.id === hookedFishRef.current!.typeId);
      if (fishDef) {
          const weight = 1 + Math.random() * 5; 
          const catchData: CatchResult = {
              fish: fishDef,
              weight: weight,
              lore: '分析中...',
              geminiAnalysis: undefined
          };
          setCatchResult(catchData);
          setScore(s => s + Math.floor(fishDef.baseValue * weight));
          setInventory(prev => ({
              ...prev,
              [fishDef.id]: (prev[fishDef.id] || 0) + 1
          }));
          
          setIsAiLoading(true);
          analyzeCatch(fishDef, weight).then(text => {
              setCatchResult(prev => prev ? { ...prev, geminiAnalysis: text } : null);
              setIsAiLoading(false);
          });
      }
    }
  }, [gameState]);


  // --- Handlers ---
  const handleCast = () => {
    if (gameState === GameState.IDLE) {
      setGameState(GameState.CASTING);
      hookRef.current = { x: 50, y: 0 };
      audioService.playCast(); 
    }
  };

  const handleReelStart = () => {
    isReelingRef.current = true;
  };
  
  const handleReelEnd = () => {
    isReelingRef.current = false;
  };

  const resetGame = () => {
      setCatchResult(null);
      setGameState(GameState.IDLE);
      hookRef.current = { x: 50, y: -10 };
      tensionRef.current = 0;
      hookedFishRef.current = null;
      if (catchResult) {
         fishRef.current = fishRef.current.filter(f => f.typeId !== catchResult.fish.id); 
      }
  };

  const handleBuyRod = () => {
    const nextLevel = upgradeState.rodLevel + 1;
    if (nextLevel < ROD_UPGRADES.length) {
        const cost = ROD_UPGRADES[nextLevel].cost;
        if (score >= cost) {
            setScore(s => s - cost);
            setUpgradeState(prev => ({ ...prev, rodLevel: nextLevel }));
        }
    }
  };

  const handleBuyReel = () => {
    const nextLevel = upgradeState.reelLevel + 1;
    if (nextLevel < REEL_UPGRADES.length) {
        const cost = REEL_UPGRADES[nextLevel].cost;
        if (score >= cost) {
            setScore(s => s - cost);
            setUpgradeState(prev => ({ ...prev, reelLevel: nextLevel }));
        }
    }
  };

  const handleResetProgress = () => {
      if (window.confirm('確定要刪除所有進度重新開始嗎？此動作無法復原。')) {
          localStorage.removeItem(SAVE_KEY);
          window.location.reload();
      }
  };

  return (
    <div className="relative w-full h-screen bg-sky-300 overflow-hidden font-sans">
      
      {/* --- Sky / Surface --- */}
      <div className="absolute top-0 w-full h-[15%] bg-gradient-to-b from-sky-300 to-sky-100 flex justify-center items-end pb-0">
         
         {/* Clouds */}
         <div className="absolute top-4 left-10 text-white opacity-60 text-4xl animate-pulse">☁️</div>
         <div className="absolute top-8 right-20 text-white opacity-40 text-3xl">☁️</div>

         {/* Boat */}
         <div className="relative z-20 animate-float mb-[-25px]">
             <div className="text-7xl transform scale-x-[-1]">🚣</div>
         </div>

         {/* UI Score */}
         <div className="absolute top-2 right-4 bg-white/90 px-3 py-1 rounded-xl shadow-lg border border-yellow-400 z-50 flex flex-col items-center scale-90 origin-top-right">
             <div className="text-[10px] text-gray-500 font-bold uppercase tracking-wider">目前餘額</div>
             <div className="text-xl font-black text-green-600">${score}</div>
         </div>

         {/* Inventory List */}
         <div className="absolute top-16 left-0 flex flex-col items-start gap-1 z-40 pointer-events-none">
             {FISH_TYPES.map((fish) => {
                 const count = inventory[fish.id] || 0;
                 if (count === 0) return null;
                 return (
                     <div key={fish.id} className="flex items-center gap-2 bg-black/60 pr-4 pl-2 py-1 rounded-r-full backdrop-blur-sm border-y border-r border-white/20 shadow-sm animate-in slide-in-from-left-full fade-in duration-300">
                         <span className="text-xl filter drop-shadow-lg">{fish.emoji}</span>
                         <span className="font-black text-white text-sm drop-shadow-md">x{count}</span>
                     </div>
                 );
             })}
         </div>

         {/* Shop Button */}
         <button 
           onClick={() => setShowShop(true)}
           className="absolute top-2 right-48 bg-yellow-400 hover:bg-yellow-300 px-3 py-1.5 rounded-full shadow-lg border border-yellow-600 z-50 flex items-center justify-center font-bold text-yellow-900 transition-colors text-xs scale-90 origin-top-right"
         >
           🛒 商店
         </button>

         {/* Help Button */}
         <button 
           onClick={() => setShowHelp(true)}
           className="absolute top-2 right-28 bg-white/90 px-3 py-1.5 rounded-full shadow-lg border border-blue-400 z-50 flex items-center justify-center font-bold text-blue-600 hover:bg-blue-50 transition-colors text-xs scale-90 origin-top-right"
         >
           📖 玩法
         </button>
         
         {/* Title */}
         <div className="absolute top-2 left-4 z-50 scale-75 origin-top-left">
             <h1 className="text-2xl font-black text-blue-900 drop-shadow-sm tracking-tighter">
                GEMINI<br/><span className="text-blue-600">釣魚大師</span>
             </h1>
         </div>
      </div>

      {/* --- Underwater --- */}
      <Ocean 
        fishes={activeFish} 
        hookPosition={hookPosition}
        gameState={gameState}
        waterHeight={85} 
      />

      {/* --- Controls --- */}
      <Controls 
        gameState={gameState}
        onCast={handleCast}
        onReelStart={handleReelStart}
        onReelEnd={handleReelEnd}
        tension={tension}
      />

      {/* --- Modal --- */}
      {gameState === GameState.CAUGHT && (
        <Modal 
            result={catchResult} 
            onClose={resetGame} 
            loading={isAiLoading}
        />
      )}
      
      {gameState === GameState.LOST && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/50 z-50 animate-bounce">
              <div className="text-4xl font-black text-white stroke-black drop-shadow-lg border-2 border-white/20 p-6 rounded-3xl backdrop-blur-sm">
                  魚跑掉了！
              </div>
          </div>
      )}

      {/* --- Shop Modal --- */}
      {showShop && (
        <Shop 
          money={score}
          upgrades={upgradeState}
          onBuyRod={handleBuyRod}
          onBuyReel={handleBuyReel}
          onClose={() => setShowShop(false)}
        />
      )}

      {/* --- Help Modal --- */}
      {showHelp && (
        <div className="absolute inset-0 z-[70] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
           <div className="bg-white rounded-2xl max-w-sm w-full p-6 shadow-2xl relative">
              <button 
                onClick={() => setShowHelp(false)}
                className="absolute top-2 right-2 text-gray-400 hover:text-gray-600 w-8 h-8"
              >✕</button>
              
              <h2 className="text-2xl font-bold text-blue-900 mb-4 text-center">🎮 遊戲說明</h2>
              
              <div className="space-y-4 text-gray-700">
                 <div className="flex items-start gap-3">
                    <span className="text-2xl bg-blue-100 p-2 rounded-lg">🎣</span>
                    <div>
                       <h3 className="font-bold text-gray-900">1. 拋竿</h3>
                       <p className="text-sm">點擊「拋竿釣魚」按鈕將魚鉤放入水中。</p>
                    </div>
                 </div>
                 
                 <div className="flex items-start gap-3">
                    <span className="text-2xl bg-yellow-100 p-2 rounded-lg">⚡</span>
                    <div>
                       <h3 className="font-bold text-gray-900">2. 等待上鉤</h3>
                       <p className="text-sm">當魚接觸魚鉤時，會自動觸發咬鉤狀態。</p>
                    </div>
                 </div>

                 <div className="flex items-start gap-3">
                    <span className="text-2xl bg-red-100 p-2 rounded-lg">💪</span>
                    <div>
                       <h3 className="font-bold text-gray-900">3. 控制張力</h3>
                       <p className="text-sm">
                       <strong className="text-red-600">按住滑鼠左鍵</strong> (或手機螢幕) 紅色按鈕來拉魚。<br/>
                       <span className="text-green-600 font-bold">綠色</span>：安全拉升<br/>
                       <span className="text-red-500 font-bold">紅色</span>：線會斷掉！(放開按鈕)<br/>
                       <span className="text-yellow-500 font-bold">黃色/無</span>：魚會脫鉤！(快按住)
                       </p>
                    </div>
                 </div>
                 
                 <div className="flex items-start gap-3">
                    <span className="text-2xl bg-yellow-400/30 p-2 rounded-lg">🛒</span>
                    <div>
                       <h3 className="font-bold text-gray-900">4. 升級裝備</h3>
                       <p className="text-sm">賺錢購買更好的釣竿(增加稀有魚機率)和捲線器(增加拉力)。</p>
                    </div>
                 </div>
              </div>
              
              <button
                onClick={() => setShowHelp(false)}
                className="w-full mt-6 bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-xl transition-colors"
              >
                我知道了，開始釣魚！
              </button>

              <div className="mt-6 pt-4 border-t border-gray-200 text-center">
                  <button
                    onClick={handleResetProgress}
                    className="text-red-500 text-xs font-bold hover:text-red-700 underline"
                  >
                    刪除存檔並重新開始
                  </button>
              </div>
           </div>
        </div>
      )}

    </div>
  );
};

export default App;