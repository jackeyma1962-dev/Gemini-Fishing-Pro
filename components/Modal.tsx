import React from 'react';
import { CatchResult } from '../types';

interface ModalProps {
  result: CatchResult | null;
  onClose: () => void;
  loading: boolean;
}

const Modal: React.FC<ModalProps> = ({ result, onClose, loading }) => {
  if (!result) return null;

  const rarityText = {
      'Common': '普通',
      'Rare': '稀有',
      'Legendary': '傳說'
  };

  return (
    <div className="absolute inset-0 z-[60] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-in fade-in duration-300">
      <div className="bg-white rounded-2xl max-w-sm w-full p-6 text-center shadow-2xl transform transition-all scale-100 border-4 border-blue-200">
        
        <div className="text-6xl mb-4 animate-bounce">{result.fish.emoji}</div>
        
        <h2 className="text-2xl font-bold text-gray-800 mb-1">{result.fish.name}</h2>
        <div className={`inline-block px-3 py-1 rounded-full text-xs font-bold text-white mb-4 ${
            result.fish.rarity === 'Legendary' ? 'bg-purple-600' :
            result.fish.rarity === 'Rare' ? 'bg-orange-500' : 'bg-blue-500'
        }`}>
            {rarityText[result.fish.rarity]}
        </div>

        <div className="bg-gray-100 rounded-lg p-3 mb-4 flex justify-between px-8">
            <div className="text-center">
                <p className="text-gray-500 text-xs uppercase">重量</p>
                <p className="text-lg font-mono font-bold text-gray-900">{result.weight.toFixed(2)} kg</p>
            </div>
            <div className="text-center">
                <p className="text-gray-500 text-xs uppercase">價值</p>
                <p className="text-lg font-mono font-bold text-green-600">${(result.fish.baseValue * result.weight).toFixed(0)}</p>
            </div>
        </div>

        <div className="text-left bg-blue-50 p-4 rounded-xl border border-blue-100 mb-6 relative overflow-hidden">
            <h3 className="text-xs font-bold text-blue-800 uppercase mb-2 flex items-center gap-2">
                ✨ Gemini 鑑定分析
            </h3>
            {loading ? (
                 <div className="flex gap-1 items-center justify-center py-2 h-12">
                    <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce"></div>
                    <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce delay-100"></div>
                    <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce delay-200"></div>
                 </div>
            ) : (
                <p className="text-sm text-gray-700 leading-relaxed text-justify">
                    {result.geminiAnalysis}
                </p>
            )}
        </div>

        <button
          onClick={onClose}
          className="w-full bg-gray-900 hover:bg-gray-800 text-white font-bold py-3 rounded-xl transition-colors shadow-md"
        >
          繼續釣魚
        </button>
      </div>
    </div>
  );
};

export default Modal;