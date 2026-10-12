import React from 'react';
import { X, Copy, Check, ChevronLeft, ChevronRight, RotateCcw } from 'lucide-react';
import { MoveRecord } from '../../types/chess';

interface MoveHistoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  moves: MoveRecord[];
  currentMoveIndex: number;
  onSelectMoveIndex: (idx: number) => void;
  pgn: string;
}

export const MoveHistoryModal: React.FC<MoveHistoryModalProps> = ({
  isOpen,
  onClose,
  moves,
  currentMoveIndex,
  onSelectMoveIndex,
  pgn,
}) => {
  const [copied, setCopied] = React.useState(false);

  if (!isOpen) return null;

  const handleCopyPgn = () => {
    navigator.clipboard.writeText(pgn || '1. e4');
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Group moves into pairs: [1. white, black], [2. white, black], etc.
  const movePairs: { num: number; white?: MoveRecord; black?: MoveRecord; whiteIdx?: number; blackIdx?: number }[] = [];
  for (let i = 0; i < moves.length; i += 2) {
    movePairs.push({
      num: Math.floor(i / 2) + 1,
      white: moves[i],
      whiteIdx: i,
      black: moves[i + 1],
      blackIdx: i + 1,
    });
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-fade-in">
      <div className="w-full max-w-md bg-stone-900 border border-stone-800 rounded-2xl shadow-2xl flex flex-col max-h-[85vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-stone-800">
          <div>
            <h3 className="text-base font-bold text-white">Histórico de Lances</h3>
            <p className="text-xs text-stone-400">Notação oficial da partida ({moves.length} movimentos)</p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-stone-400 hover:text-white hover:bg-stone-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Moves Table */}
        <div className="flex-1 overflow-y-auto p-4 space-y-1">
          {movePairs.length === 0 ? (
            <div className="text-center py-8 text-stone-500 text-sm">
              Nenhum lance realizado ainda. Comece a jogar no tabuleiro!
            </div>
          ) : (
            movePairs.map((pair) => (
              <div
                key={pair.num}
                className="grid grid-cols-12 gap-1 items-center py-1 px-2 rounded-lg hover:bg-stone-800/50 text-xs font-mono"
              >
                <span className="col-span-2 text-stone-500">{pair.num}.</span>
                {pair.white && (
                  <button
                    onClick={() => pair.whiteIdx !== undefined && onSelectMoveIndex(pair.whiteIdx)}
                    className={`col-span-5 text-left px-2 py-1 rounded transition-colors ${
                      currentMoveIndex === pair.whiteIdx
                        ? 'bg-amber-500/20 text-amber-300 font-bold'
                        : 'text-stone-200 hover:bg-stone-800'
                    }`}
                  >
                    {pair.white.san}
                  </button>
                )}
                {pair.black && (
                  <button
                    onClick={() => pair.blackIdx !== undefined && onSelectMoveIndex(pair.blackIdx)}
                    className={`col-span-5 text-left px-2 py-1 rounded transition-colors ${
                      currentMoveIndex === pair.blackIdx
                        ? 'bg-amber-500/20 text-amber-300 font-bold'
                        : 'text-stone-300 hover:bg-stone-800'
                    }`}
                  >
                    {pair.black.san}
                  </button>
                )}
              </div>
            ))
          )}
        </div>

        {/* Navigation Scrub Bar */}
        <div className="flex items-center justify-between px-4 py-2 bg-stone-950/60 border-t border-stone-800 text-xs">
          <div className="flex items-center gap-1">
            <button
              onClick={() => onSelectMoveIndex(-1)}
              disabled={currentMoveIndex === -1}
              className="p-1.5 rounded bg-stone-800 hover:bg-stone-700 disabled:opacity-30 text-stone-300"
              title="Posição Inicial"
            >
              <RotateCcw className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => onSelectMoveIndex(Math.max(-1, currentMoveIndex - 1))}
              disabled={currentMoveIndex <= -1}
              className="p-1.5 rounded bg-stone-800 hover:bg-stone-700 disabled:opacity-30 text-stone-300"
              title="Lance Anterior"
            >
              <ChevronLeft className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => onSelectMoveIndex(Math.min(moves.length - 1, currentMoveIndex + 1))}
              disabled={currentMoveIndex >= moves.length - 1}
              className="p-1.5 rounded bg-stone-800 hover:bg-stone-700 disabled:opacity-30 text-stone-300"
              title="Próximo Lance"
            >
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <button
            onClick={handleCopyPgn}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-stone-800 hover:bg-stone-700 text-stone-200 transition-colors"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copied ? 'Copiado!' : 'Copiar PGN'}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
