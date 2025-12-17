import React from 'react';
import { ActiveFish, FishType, GameState, HookPosition } from '../types';
import { FISH_TYPES } from '../constants';

interface OceanProps {
  fishes: ActiveFish[];
  hookPosition: HookPosition;
  gameState: GameState;
  waterHeight: number; // percentage
}

const Ocean: React.FC<OceanProps> = ({ fishes, hookPosition, gameState, waterHeight }) => {
  
  const getFishStyle = (fish: ActiveFish) => {
    const fishDef = FISH_TYPES.find(f => f.id === fish.typeId);
    return {
      left: `${fish.x}%`,
      top: `${fish.y}%`,
      // Changed transform logic:
      // 1. Translate (-50%, -50%) centers the fish on its position x,y
      // 2. scaleX(${-fish.direction}) flips the emoji horizontally. 
      //    We invert direction because standard emojis face left.
      //    Moving Right (1) -> scaleX(-1) -> Faces Right.
      //    Moving Left (-1) -> scaleX(1) -> Faces Left.
      transform: `translate(-50%, -50%) scaleX(${-fish.direction})`,
      fontSize: fishDef?.rarity === 'Legendary' ? '3rem' : '2rem',
      filter: `drop-shadow(0 0 5px ${fishDef?.color})`,
    };
  };

  const isMoving = gameState === GameState.SINKING || gameState === GameState.REELING;

  return (
    <div className="absolute bottom-0 w-full overflow-hidden transition-all duration-1000" style={{ height: `${waterHeight}%` }}>
      
      {/* Surface Waves Layer 1 (Back) */}
      <div className="absolute top-[-20px] left-0 w-[200%] h-[40px] opacity-40 z-10 animate-wave-slow pointer-events-none">
         <svg viewBox="0 0 1200 120" preserveAspectRatio="none" className="w-full h-full fill-blue-400">
             <path d="M321.39,56.44c58-10.79,114.16-30.13,172-41.86,82.39-16.72,168.19-17.73,250.45-.39C823.78,31,906.67,72,985.66,92.83c70.05,18.48,146.53,26.09,214.34,3V0H0V27.35A600.21,600.21,0,0,0,321.39,56.44Z"></path>
         </svg>
      </div>

      {/* Surface Waves Layer 2 (Front) */}
      <div className="absolute top-[-20px] left-0 w-[200%] h-[40px] opacity-60 z-10 animate-wave pointer-events-none">
         <svg viewBox="0 0 1200 120" preserveAspectRatio="none" className="w-full h-full fill-cyan-300">
             <path d="M985.66,92.83C906.67,72,823.78,31,743.84,14.19c-82.26-17.34-168.06-16.33-250.45.39-57.84,11.73-114,31.07-172,41.86A600.21,600.21,0,0,1,0,27.35V120H1200V95.8C1132.19,118.92,1055.71,111.31,985.66,92.83Z"></path>
         </svg>
      </div>

      {/* Ocean Gradient */}
      <div className="absolute inset-0 bg-gradient-to-b from-cyan-400 via-blue-600 to-indigo-950 opacity-90"></div>
      
      {/* Moving Caustics (Light Rays) */}
      <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-20 mix-blend-overlay animate-drift bg-repeat" style={{ backgroundSize: '100px 100px'}}></div>

      {/* Fish */}
      {fishes.map((fish) => {
        const def = FISH_TYPES.find(f => f.id === fish.typeId);
        return (
          <div
            key={fish.id}
            className="absolute fish-swim pointer-events-none select-none z-20"
            style={getFishStyle(fish)}
          >
            {def?.emoji}
          </div>
        );
      })}

      {/* Hook Line */}
      {(gameState !== GameState.IDLE) && (
        <svg className="absolute inset-0 w-full h-full pointer-events-none z-10">
          <line
            x1="50%"
            y1="0" // Relative to ocean top
            x2={`${hookPosition.x}%`}
            y2={`${hookPosition.y}%`}
            stroke="white"
            strokeWidth="1.5"
            strokeOpacity="0.6"
            strokeDasharray="4"
          />
        </svg>
      )}

      {/* The Hook & Ripples */}
      {(gameState !== GameState.IDLE) && (
        <div 
          className="absolute z-30"
          style={{
            left: `${hookPosition.x}%`,
            top: `${hookPosition.y}%`,
            transform: 'translate(-50%, -50%)'
          }}
        >
          {/* Movement Ripple Effect */}
          {isMoving && (
             <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-8 h-8 rounded-full border border-white opacity-50 animate-ripple-out"></div>
          )}

          {/* Hook Body */}
          <div className="relative w-4 h-4 bg-gray-200 rounded-full border-2 border-gray-600">
            <div className="absolute -bottom-2 left-1/2 w-1 h-3 bg-gray-400 -translate-x-1/2"></div>
            {/* Bait if not hooked */}
            {gameState !== GameState.HOOKED && gameState !== GameState.REELING && (
                <div className="absolute top-1 left-1 w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
            )}
          </div>
        </div>
      )}

      {/* Surface Interaction Ripple (Where the line enters) */}
      {gameState !== GameState.IDLE && (
          <div 
            className="absolute top-0 z-20 w-12 h-2 bg-white/30 rounded-[100%] blur-[2px] animate-pulse"
            style={{ 
                left: `50%`,
                transform: 'translate(-50%, -50%)'
            }}
          ></div>
      )}
      
      {/* Bubbles */}
      <div className="absolute bottom-0 w-full h-full pointer-events-none overflow-hidden z-10">
         {[...Array(5)].map((_, i) => (
             <div key={i} className="absolute bg-white rounded-full opacity-10 animate-float"
                  style={{
                      left: `${10 + i * 20}%`,
                      width: `${5 + Math.random() * 10}px`,
                      height: `${5 + Math.random() * 10}px`,
                      animationDelay: `${i * 0.5}s`,
                      bottom: '-20px'
                  }}
             ></div>
         ))}
      </div>
    </div>
  );
};

export default Ocean;