import React, { useState } from 'react';
import { X, ShoppingBag, Coins, Check, Sparkles, Lock } from 'lucide-react';
import { BoardTheme, BoardThemeId, PieceTheme, PieceThemeId } from '../../types/chess';
import { BOARD_THEMES, PIECE_THEMES } from '../../utils/themes';
import { soundManager } from '../../utils/soundEffects';

interface CosmeticsModalProps {
  isOpen: boolean;
  onClose: () => void;
  playerCoins: number;
  unlockedBoards: BoardThemeId[];
  unlockedPieces: PieceThemeId[];
  equippedBoard: BoardThemeId;
  equippedPiece: PieceThemeId;
  onBuyBoard: (theme: BoardTheme) => void;
  onBuyPiece: (theme: PieceTheme) => void;
  onEquipBoard: (themeId: BoardThemeId) => void;
  onEquipPiece: (themeId: PieceThemeId) => void;
}

export const CosmeticsModal: React.FC<CosmeticsModalProps> = ({
  isOpen,
  onClose,
  playerCoins,
  unlockedBoards,
  unlockedPieces,
  equippedBoard,
  equippedPiece,
  onBuyBoard,
  onBuyPiece,
  onEquipBoard,
  onEquipPiece,
}) => {
  const [activeTab, setActiveTab] = useState<'boards' | 'pieces'>('boards');

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-md animate-fade-in">
      <div className="w-full max-w-xl bg-stone-900 border border-stone-800 rounded-3xl shadow-2xl flex flex-col max-h-[88vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-stone-800 bg-stone-950/60">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400">
              <ShoppingBag className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-white">Loja de Cosméticos 3D</h3>
              <p className="text-xs text-stone-400">Personalize o visual realista do tabuleiro e das peças</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {/* Coin balance indicator */}
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-300 font-bold text-xs">
              <Coins className="w-4 h-4 text-amber-400" />
              <span>{playerCoins}</span>
            </div>

            <button
              onClick={onClose}
              className="p-2 rounded-xl text-stone-400 hover:text-white hover:bg-stone-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Tab switcher */}
        <div className="px-5 pt-3 pb-1 border-b border-stone-800/80 flex items-center gap-2">
          <button
            onClick={() => setActiveTab('boards')}
            className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all ${
              activeTab === 'boards'
                ? 'bg-amber-500 text-stone-950 shadow-md'
                : 'text-stone-400 hover:text-white hover:bg-stone-800'
            }`}
          >
            Tabuleiros 3D
          </button>
          <button
            onClick={() => setActiveTab('pieces')}
            className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all ${
              activeTab === 'pieces'
                ? 'bg-amber-500 text-stone-950 shadow-md'
                : 'text-stone-400 hover:text-white hover:bg-stone-800'
            }`}
          >
            Conjuntos de Peças
          </button>
        </div>

        {/* Grid of Items */}
        <div className="p-5 overflow-y-auto space-y-3 flex-1">
          {activeTab === 'boards' ? (
            BOARD_THEMES.map((theme) => {
              const isUnlocked = unlockedBoards.includes(theme.id) || theme.price === 0;
              const isEquipped = equippedBoard === theme.id;

              return (
                <div
                  key={theme.id}
                  className={`p-4 rounded-2xl border transition-all flex items-center justify-between gap-4 ${
                    isEquipped
                      ? 'bg-amber-950/20 border-amber-500/60 shadow-lg shadow-amber-500/5'
                      : 'bg-stone-950/60 border-stone-800 hover:border-stone-700'
                  }`}
                >
                  <div className="flex items-center gap-3.5">
                    {/* Swatch Preview */}
                    <div className="w-12 h-12 rounded-xl border border-stone-700 overflow-hidden grid grid-cols-2 shadow-inner shrink-0">
                      <div style={{ backgroundColor: `#${theme.lightSquare.toString(16).padStart(6, '0')}` }} />
                      <div style={{ backgroundColor: `#${theme.darkSquare.toString(16).padStart(6, '0')}` }} />
                      <div style={{ backgroundColor: `#${theme.darkSquare.toString(16).padStart(6, '0')}` }} />
                      <div style={{ backgroundColor: `#${theme.lightSquare.toString(16).padStart(6, '0')}` }} />
                    </div>

                    <div>
                      <div className="flex items-center gap-2">
                        <h4 className="text-sm font-bold text-white">{theme.name}</h4>
                        {isEquipped && (
                          <span className="text-[10px] font-bold text-amber-400 bg-amber-950/60 px-1.5 py-0.5 rounded border border-amber-500/30">
                            Equipado
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-stone-400 mt-0.5">{theme.description}</p>
                    </div>
                  </div>

                  {/* Actions */}
                  <div>
                    {isEquipped ? (
                      <div className="flex items-center gap-1 text-xs font-semibold text-amber-400 px-3 py-2">
                        <Check className="w-4 h-4" />
                        <span>Em Uso</span>
                      </div>
                    ) : isUnlocked ? (
                      <button
                        onClick={() => {
                          onEquipBoard(theme.id);
                          soundManager.playClick();
                        }}
                        className="px-4 py-2 rounded-xl bg-stone-800 hover:bg-stone-700 text-stone-100 text-xs font-semibold transition-colors"
                      >
                        Equipar
                      </button>
                    ) : (
                      <button
                        onClick={() => onBuyBoard(theme)}
                        disabled={playerCoins < theme.price}
                        className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-stone-950 text-xs font-bold transition-all flex items-center gap-1.5 disabled:opacity-40 shadow-lg shadow-amber-500/10"
                      >
                        <Coins className="w-3.5 h-3.5" />
                        <span>{theme.price}</span>
                      </button>
                    )}
                  </div>
                </div>
              );
            })
          ) : (
            PIECE_THEMES.map((theme) => {
              const isUnlocked = unlockedPieces.includes(theme.id) || theme.price === 0;
              const isEquipped = equippedPiece === theme.id;

              return (
                <div
                  key={theme.id}
                  className={`p-4 rounded-2xl border transition-all flex items-center justify-between gap-4 ${
                    isEquipped
                      ? 'bg-amber-950/20 border-amber-500/60 shadow-lg shadow-amber-500/5'
                      : 'bg-stone-950/60 border-stone-800 hover:border-stone-700'
                  }`}
                >
                  <div className="flex items-center gap-3.5">
                    {/* Swatch Preview */}
                    <div className="w-12 h-12 rounded-xl border border-stone-700 flex items-center justify-center gap-1 bg-stone-900 shrink-0">
                      <div
                        className="w-4 h-8 rounded-full shadow"
                        style={{ backgroundColor: `#${theme.whiteColor.toString(16).padStart(6, '0')}` }}
                      />
                      <div
                        className="w-4 h-8 rounded-full shadow"
                        style={{ backgroundColor: `#${theme.blackColor.toString(16).padStart(6, '0')}` }}
                      />
                    </div>

                    <div>
                      <div className="flex items-center gap-2">
                        <h4 className="text-sm font-bold text-white">{theme.name}</h4>
                        {isEquipped && (
                          <span className="text-[10px] font-bold text-amber-400 bg-amber-950/60 px-1.5 py-0.5 rounded border border-amber-500/30">
                            Equipado
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-stone-400 mt-0.5">{theme.description}</p>
                    </div>
                  </div>

                  {/* Actions */}
                  <div>
                    {isEquipped ? (
                      <div className="flex items-center gap-1 text-xs font-semibold text-amber-400 px-3 py-2">
                        <Check className="w-4 h-4" />
                        <span>Em Uso</span>
                      </div>
                    ) : isUnlocked ? (
                      <button
                        onClick={() => {
                          onEquipPiece(theme.id);
                          soundManager.playClick();
                        }}
                        className="px-4 py-2 rounded-xl bg-stone-800 hover:bg-stone-700 text-stone-100 text-xs font-semibold transition-colors"
                      >
                        Equipar
                      </button>
                    ) : (
                      <button
                        onClick={() => onBuyPiece(theme)}
                        disabled={playerCoins < theme.price}
                        className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-stone-950 text-xs font-bold transition-all flex items-center gap-1.5 disabled:opacity-40 shadow-lg shadow-amber-500/10"
                      >
                        <Coins className="w-3.5 h-3.5" />
                        <span>{theme.price}</span>
                      </button>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
};
