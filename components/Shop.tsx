import React from 'react';
import { ROD_UPGRADES, REEL_UPGRADES } from '../constants';
import { UpgradeState } from '../types';

interface ShopProps {
  money: number;
  upgrades: UpgradeState;
  onBuyRod: () => void;
  onBuyReel: () => void;
  onClose: () => void;
}

const Shop: React.FC<ShopProps> = ({ money, upgrades, onBuyRod, onBuyReel, onClose }) => {
  
  const currentRod = ROD_UPGRADES[upgrades.rodLevel];
  const nextRod = ROD_UPGRADES[upgrades.rodLevel + 1];
  
  const currentReel = REEL_UPGRADES[upgrades.reelLevel];
  const nextReel = REEL_UPGRADES[upgrades.reelLevel + 1];

  return (
    <div className="absolute inset-0 z-[80] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="bg-slate-900 rounded-2xl max-w-lg w-full p-6 shadow-2xl border-2 border-yellow-500 relative text-white">
        <button 
          onClick={onClose}
          className="absolute top-2 right-4 text-gray-400 hover:text-white text-2xl"
        >✕</button>
        
        <h2 className="text-3xl font-black text-yellow-400 mb-2 text-center tracking-tight">
          🛒 釣具商店
        </h2>
        <div className="text-center mb-6 text-green-400 font-mono text-xl font-bold border-b border-gray-700 pb-4">
          持有現金: ${money}
        </div>

        <div className="space-y-6">
          {/* Rod Upgrade Section */}
          <div className="bg-gray-800 p-4 rounded-xl border border-gray-700">
            <div className="flex justify-between items-center mb-2">
               <h3 className="text-xl font-bold flex items-center gap-2">
                 🎣 釣竿等級 <span className="text-xs bg-blue-600 px-2 py-0.5 rounded-full">Lv.{currentRod.level}</span>
               </h3>
            </div>
            <p className="text-gray-400 text-sm mb-3 h-10">{currentRod.description}</p>
            
            {nextRod ? (
               <div className="flex items-center justify-between mt-2">
                 <div className="text-sm text-yellow-200">
                    下一級: <span className="font-bold text-white">{nextRod.name}</span>
                 </div>
                 <button
                    onClick={onBuyRod}
                    disabled={money < nextRod.cost}
                    className={`px-4 py-2 rounded-lg font-bold transition-all ${
                        money >= nextRod.cost 
                        ? 'bg-yellow-500 hover:bg-yellow-400 text-black shadow-[0_0_15px_rgba(234,179,8,0.5)]' 
                        : 'bg-gray-600 text-gray-400 cursor-not-allowed'
                    }`}
                 >
                    升級 (${nextRod.cost})
                 </button>
               </div>
            ) : (
                <div className="text-center bg-gray-700 py-2 rounded-lg text-yellow-500 font-bold">
                    已達最高等級
                </div>
            )}
          </div>

          {/* Reel Upgrade Section */}
          <div className="bg-gray-800 p-4 rounded-xl border border-gray-700">
            <div className="flex justify-between items-center mb-2">
               <h3 className="text-xl font-bold flex items-center gap-2">
                 ⚙️ 捲線器等級 <span className="text-xs bg-red-600 px-2 py-0.5 rounded-full">Lv.{currentReel.level}</span>
               </h3>
            </div>
             <p className="text-gray-400 text-sm mb-3 h-10">{currentReel.description}</p>

            {nextReel ? (
               <div className="flex items-center justify-between mt-2">
                 <div className="text-sm text-yellow-200">
                    下一級: <span className="font-bold text-white">{nextReel.name}</span>
                 </div>
                 <button
                    onClick={onBuyReel}
                    disabled={money < nextReel.cost}
                    className={`px-4 py-2 rounded-lg font-bold transition-all ${
                        money >= nextReel.cost 
                        ? 'bg-yellow-500 hover:bg-yellow-400 text-black shadow-[0_0_15px_rgba(234,179,8,0.5)]' 
                        : 'bg-gray-600 text-gray-400 cursor-not-allowed'
                    }`}
                 >
                    升級 (${nextReel.cost})
                 </button>
               </div>
            ) : (
                <div className="text-center bg-gray-700 py-2 rounded-lg text-yellow-500 font-bold">
                    已達最高等級
                </div>
            )}
          </div>
        </div>

      </div>
    </div>
  );
};

export default Shop;