import React, { useEffect, useRef, useState } from 'react';
import confetti from 'canvas-confetti';
import { Trophy, Share2, Copy, Download, RefreshCw, Eye, Check, ArrowRight, ShieldAlert, Award } from 'lucide-react';
import { GameStats, PieceColor } from '../../types/chess';
import { soundManager } from '../../utils/soundEffects';

interface PostGameModalProps {
  isOpen: boolean;
  onClose: () => void;
  stats: GameStats;
  playerWhiteName: string;
  playerBlackName: string;
  onRematch: () => void;
  onReviewBoard: () => void;
}

export const PostGameModal: React.FC<PostGameModalProps> = ({
  isOpen,
  onClose,
  stats,
  playerWhiteName,
  playerBlackName,
  onRematch,
  onReviewBoard,
}) => {
  const [copiedShare, setCopiedShare] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isOpen) {
      if (stats.winner === 'w' || stats.winner === 'b') {
        soundManager.playVictory();
        // Trigger celebratory confetti burst
        confetti({
          particleCount: 80,
          spread: 70,
          origin: { y: 0.6 },
          colors: ['#f59e0b', '#10b981', '#38bdf8', '#fbbf24'],
        });
      }
    }
  }, [isOpen, stats.winner]);

  if (!isOpen) return null;

  const winnerName =
    stats.winner === 'w' ? playerWhiteName : stats.winner === 'b' ? playerBlackName : 'Empate';

  const reasonLabel =
    stats.reason === 'checkmate'
      ? 'Vitória por Xeque-Mate'
      : stats.reason === 'timeout'
      ? 'Vitória por Tempo Esgotado'
      : stats.reason === 'resignation'
      ? 'Vitória por Desistência'
      : stats.reason === 'stalemate'
      ? 'Empate por Afogamento do Rei'
      : stats.reason === 'draw_agreed'
      ? 'Empate por Mútuo Acordo'
      : 'Fim de Jogo';

  const shareText = `♟️ Partida Épica no Grandmaster 3D Chess!\n👑 Vencedor: ${winnerName}\n⚔️ Motivo: ${reasonLabel}\n🎯 Precisão: Brancas ${stats.whiteAccuracy}% | Pretas ${stats.blackAccuracy}%\n📊 Lances: ${stats.moveCount}\nJogue agora em 3D realista!`;

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'Vitória no Grandmaster 3D Chess',
          text: shareText,
          url: window.location.href,
        });
      } catch {
        // User cancelled or unsupported
      }
    } else {
      navigator.clipboard.writeText(shareText);
      setCopiedShare(true);
      setTimeout(() => setCopiedShare(false), 2500);
    }
  };

  // Generate SVG path for material advantage history
  const renderAdvantageGraph = () => {
    const history = stats.materialAdvantageHistory;
    if (!history || history.length < 2) {
      return (
        <div className="h-16 flex items-center justify-center text-xs text-stone-500">
          Dados de vantagem não disponíveis para partidas muito curtas.
        </div>
      );
    }

    const width = 360;
    const height = 64;
    const midY = height / 2;
    const maxAdv = Math.max(5, ...history.map((v) => Math.abs(v)));

    const points = history.map((val, idx) => {
      const x = (idx / (history.length - 1)) * width;
      // val > 0 means White advantage (upwards, smaller Y), val < 0 means Black advantage (downwards)
      const y = midY - (val / maxAdv) * (midY - 6);
      return `${x},${y}`;
    });

    const pathData = `M 0,${midY} L ${points.join(' L ')}`;

    return (
      <div className="relative w-full h-16 bg-stone-950/80 rounded-xl overflow-hidden p-1 border border-stone-800">
        <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-full">
          {/* Neutral center line */}
          <line x1="0" y1={midY} x2={width} y2={midY} stroke="#44403c" strokeDasharray="3,3" strokeWidth="1" />
          {/* Curve */}
          <path d={pathData} fill="none" stroke="#f59e0b" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
        <div className="absolute top-1 left-2 text-[9px] font-semibold text-stone-400">Brancas +</div>
        <div className="absolute bottom-1 left-2 text-[9px] font-semibold text-stone-400">Pretas +</div>
      </div>
    );
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-md animate-fade-in overflow-y-auto">
      <div
        ref={cardRef}
        className="w-full max-w-lg bg-stone-900 border border-stone-800 rounded-3xl shadow-2xl flex flex-col overflow-hidden my-auto"
      >
        {/* Banner with Trophy & Winner Announcement */}
        <div className="relative p-6 sm:p-7 text-center bg-gradient-to-b from-amber-500/15 via-stone-900 to-stone-900 border-b border-stone-800">
          <div className="w-16 h-16 sm:w-20 sm:h-20 mx-auto mb-3 rounded-2xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center shadow-lg shadow-amber-500/10">
            <Trophy className="w-8 h-8 sm:w-10 sm:h-10 text-amber-400" />
          </div>

          <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight">
            {stats.winner === 'draw' ? 'Empate Técnico!' : `Vitória de ${winnerName}!`}
          </h2>
          <p className="text-xs sm:text-sm font-medium text-amber-400 mt-0.5">{reasonLabel}</p>
        </div>

        {/* Content Body */}
        <div className="p-5 sm:p-6 space-y-5">
          {/* Accuracy Comparison */}
          <div className="bg-stone-950/70 p-4 rounded-2xl border border-stone-800/80 space-y-3">
            <div className="flex items-center justify-between text-xs text-stone-400 font-medium">
              <span>Precisão dos Lances</span>
              <span>Análise Pós-Partida</span>
            </div>

            <div className="space-y-2">
              {/* White Player Accuracy */}
              <div>
                <div className="flex justify-between text-xs font-semibold mb-1">
                  <span className="text-stone-200">Brancas: {playerWhiteName}</span>
                  <span className="text-emerald-400">{stats.whiteAccuracy}%</span>
                </div>
                <div className="h-2 w-full bg-stone-800 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-emerald-500 rounded-full transition-all duration-1000"
                    style={{ width: `${stats.whiteAccuracy}%` }}
                  />
                </div>
              </div>

              {/* Black Player Accuracy */}
              <div>
                <div className="flex justify-between text-xs font-semibold mb-1">
                  <span className="text-stone-200">Pretas: {playerBlackName}</span>
                  <span className="text-amber-400">{stats.blackAccuracy}%</span>
                </div>
                <div className="h-2 w-full bg-stone-800 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-amber-500 rounded-full transition-all duration-1000"
                    style={{ width: `${stats.blackAccuracy}%` }}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Quick Metrics Grid */}
          <div className="grid grid-cols-3 gap-2">
            <div className="bg-stone-950/60 p-3 rounded-xl border border-stone-800/60 text-center">
              <span className="text-[10px] text-stone-400 font-medium block">Total Lances</span>
              <span className="text-lg font-bold text-white font-mono">{stats.moveCount}</span>
            </div>
            <div className="bg-stone-950/60 p-3 rounded-xl border border-stone-800/60 text-center">
              <span className="text-[10px] text-stone-400 font-medium block">Tempo Total</span>
              <span className="text-lg font-bold text-white font-mono">
                {Math.floor(stats.durationSeconds / 60)}m {stats.durationSeconds % 60}s
              </span>
            </div>
            <div className="bg-stone-950/60 p-3 rounded-xl border border-stone-800/60 text-center">
              <span className="text-[10px] text-stone-400 font-medium block">Capturas</span>
              <span className="text-lg font-bold text-white font-mono">
                {stats.whiteCaptures.length + stats.blackCaptures.length}
              </span>
            </div>
          </div>

          {/* Material Advantage History Chart */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between text-xs font-semibold text-stone-300">
              <span>Oscilação de Vantagem</span>
              <span className="text-[10px] text-stone-400">Ao longo da partida</span>
            </div>
            {renderAdvantageGraph()}
          </div>
        </div>

        {/* Footer Action Buttons */}
        <div className="p-5 sm:p-6 bg-stone-950/90 border-t border-stone-800 flex flex-col sm:flex-row items-center gap-2.5">
          {/* Share Victory Card */}
          <button
            onClick={handleShare}
            className="w-full sm:flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-stone-950 font-bold text-sm shadow-lg shadow-amber-500/20 active:scale-98 transition-all"
          >
            {copiedShare ? <Check className="w-4 h-4 text-stone-950" /> : <Share2 className="w-4 h-4 text-stone-950" />}
            <span>{copiedShare ? 'Copiado para Área de Transferência!' : 'Compartilhar Vitória'}</span>
          </button>

          {/* Review Board */}
          <button
            onClick={() => {
              onReviewBoard();
              onClose();
            }}
            className="w-full sm:w-auto flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-stone-800 hover:bg-stone-700 text-stone-200 font-semibold text-sm transition-all"
          >
            <Eye className="w-4 h-4" />
            <span>Ver Tabuleiro</span>
          </button>

          {/* Rematch */}
          <button
            onClick={() => {
              onRematch();
              onClose();
            }}
            className="w-full sm:w-auto flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-stone-800 hover:bg-stone-700 text-amber-400 font-semibold text-sm transition-all"
          >
            <RefreshCw className="w-4 h-4" />
            <span>Revanche</span>
          </button>
        </div>
      </div>
    </div>
  );
};
