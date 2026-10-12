import React from 'react';
import { PieceColor } from '../../types/chess';

interface PromotionModalProps {
  isOpen: boolean;
  color: PieceColor;
  onSelectPiece: (piece: 'q' | 'r' | 'b' | 'n') => void;
}

export const PromotionModal: React.FC<PromotionModalProps> = ({
  isOpen,
  color,
  onSelectPiece,
}) => {
  if (!isOpen) return null;

  const pieces = [
    { type: 'q' as const, label: 'Dama', symbol: color === 'w' ? '♕' : '♛' },
    { type: 'r' as const, label: 'Torre', symbol: color === 'w' ? '♖' : '♜' },
    { type: 'b' as const, label: 'Bispo', symbol: color === 'w' ? '♗' : '♝' },
    { type: 'n' as const, label: 'Cavalo', symbol: color === 'w' ? '♘' : '♞' },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
      <div className="bg-stone-900 border border-stone-800 rounded-3xl p-6 shadow-2xl max-w-sm w-full text-center space-y-4">
        <div>
          <h3 className="text-lg font-bold text-white">Promoção do Peão</h3>
          <p className="text-xs text-stone-400">Escolha a peça para transformar seu peão</p>
        </div>

        <div className="grid grid-cols-4 gap-2.5">
          {pieces.map((p) => (
            <button
              key={p.type}
              onClick={() => onSelectPiece(p.type)}
              className="p-3.5 rounded-2xl bg-stone-950 hover:bg-amber-500/20 border border-stone-800 hover:border-amber-500/60 transition-all flex flex-col items-center gap-1 group active:scale-95"
            >
              <span className="text-3xl text-stone-200 group-hover:text-amber-400 transition-colors">
                {p.symbol}
              </span>
              <span className="text-[11px] font-semibold text-stone-400 group-hover:text-amber-300">
                {p.label}
              </span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};
