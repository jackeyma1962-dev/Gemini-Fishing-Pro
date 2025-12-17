import React from 'react';
import { GameState } from '../types';

interface ControlsProps {
  gameState: GameState;
  onCast: () => void;
  onReelStart: () => void;
  onReelEnd: () => void;
  tension: number;
}

const Controls: React.FC<ControlsProps> = ({ gameState, onCast, onReelStart, onReelEnd, tension }) => {
  
  if (gameState === GameState.IDLE) {
    return (
      <div className="absolute bottom-10 left-0 w-full flex justify-center z-50">
        <button
          onClick={onCast}
          className="bg-yellow-400 hover:bg-yellow-300 text-yellow-900 font-bold py-4 px-8 rounded-full shadow-lg border-b-4 border-yellow-600 active:border-b-0 active:translate-y-1 transition-all text-xl animate-bounce"
        >
          🎣 拋竿釣魚
        </button>
      </div>
    );
  }

  if (gameState === GameState.CASTING || gameState === GameState.SINKING) {
      return (
         <div className="absolute bottom-10 left-0 w-full flex justify-center z-50">
             <div className="bg-black/50 text-white px-4 py-2 rounded-full backdrop-blur-sm border border-white/20">
                 等待魚兒上鉤...
             </div>
         </div>
      )
  }

  if (gameState === GameState.HOOKED || gameState === GameState.REELING) {
    const tensionColor = tension > 80 ? 'bg-red-500' : tension > 30 ? 'bg-green-500' : 'bg-yellow-500';
    
    return (
      <div className="absolute bottom-8 left-0 w-full flex flex-col items-center gap-4 z-50 px-4 select-none">
        {/* Tension Bar */}
        <div className="w-full max-w-md h-8 bg-gray-800 rounded-full border-2 border-gray-600 relative overflow-hidden shadow-lg">
            <div className="absolute inset-y-0 left-[30%] right-[20%] bg-green-900/50 border-x border-green-500/50"></div>
            <div 
                className={`h-full transition-all duration-100 ${tensionColor}`}
                style={{ width: `${tension}%` }}
            ></div>
            <span className="absolute inset-0 flex items-center justify-center text-xs font-bold uppercase tracking-wider text-white shadow-black drop-shadow-md">
                釣線張力
            </span>
        </div>

        <button
          onMouseDown={onReelStart}
          onMouseUp={onReelEnd}
          onMouseLeave={onReelEnd}
          onTouchStart={onReelStart}
          onTouchEnd={onReelEnd}
          className="w-24 h-24 bg-red-500 hover:bg-red-400 rounded-full shadow-xl border-4 border-red-700 flex items-center justify-center active:scale-95 transition-transform touch-none select-none"
        >
          <span className="text-2xl font-black text-white leading-tight text-center">按住<br/>收線</span>
        </button>
        <p className="text-white text-sm font-medium drop-shadow-md bg-black/30 px-3 py-1 rounded-full text-center">
            按住紅色按鈕不放來拉魚<br/>
            鬆開按鈕可降低張力
        </p>
      </div>
    );
  }

  return null;
};

export default Controls;