import React from 'react';
import { RotateCw, Camera, Volume2, VolumeX, Lightbulb, Undo2, Flag, Handshake, ScrollText, Play, Pause } from 'lucide-react';
import { PieceColor, PlayerProfile } from '../../types/chess';
import { CameraPreset } from '../Chess3D/ChessCanvas';

interface GameHUDProps {
  playerWhite: { name: string; title?: string; avatar: string; elo?: number };
  playerBlack: { name: string; title?: string; avatar: string; elo?: number };
  activeTurn: PieceColor;
  whiteTime: number; // in seconds (-1 for unlimited)
  blackTime: number;
  whiteCaptures: string[];
  blackCaptures: string[];
  autoRotate: boolean;
  onToggleAutoRotate: () => void;
  onManualFlipCamera: () => void;
  onSelectCameraPreset: (preset: CameraPreset) => void;
  onUndoMove?: () => void;
  onGetHint?: () => void;
  onResign: () => void;
  onOfferDraw: () => void;
  onOpenMoveHistory: () => void;
  isMuted: boolean;
  onToggleMute: () => void;
  gameMode: string;
  isGameOver: boolean;
  canUndo?: boolean;
}

export const GameHUD: React.FC<GameHUDProps> = ({
  playerWhite,
  playerBlack,
  activeTurn,
  whiteTime,
  blackTime,
  whiteCaptures,
  blackCaptures,
  autoRotate,
  onToggleAutoRotate,
  onManualFlipCamera,
  onSelectCameraPreset,
  onUndoMove,
  onGetHint,
  onResign,
  onOfferDraw,
  onOpenMoveHistory,
  isMuted,
  onToggleMute,
  gameMode,
  isGameOver,
  canUndo = true,
}) => {
  // Format seconds into MM:SS
  const formatTime = (secs: number) => {
    if (secs < 0) return '∞';
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  // Calculate material difference
  const pieceValues: Record<string, number> = { p: 1, n: 3, b: 3, r: 5, q: 9 };
  const whiteMatScore = whiteCaptures.reduce((acc, p) => acc + (pieceValues[p.toLowerCase()] || 0), 0);
  const blackMatScore = blackCaptures.reduce((acc, p) => acc + (pieceValues[p.toLowerCase()] || 0), 0);
  const whiteAdvantage = whiteMatScore - blackMatScore;

  // Unicode piece symbols for capture tray
  const pieceSymbols: Record<string, string> = {
    p: '♟',
    n: '♞',
    b: '♝',
    r: '♜',
    q: '♛',
  };

  return (
    <div className="absolute inset-0 pointer-events-none flex flex-col justify-between p-3 sm:p-4 z-10">
      {/* Top Header: Opponent/Player Black Profile & Clock */}
      <div className="flex items-center justify-between gap-2 pointer-events-auto">
        {/* Black Player Card */}
        <div
          className={`flex items-center gap-2.5 sm:gap-3 px-3 py-2 rounded-xl transition-all backdrop-blur-md border ${
            activeTurn === 'b' && !isGameOver
              ? 'bg-stone-900/90 border-amber-500/80 shadow-lg shadow-amber-500/10 ring-1 ring-amber-500/50'
              : 'bg-stone-900/70 border-white/10'
          }`}
        >
          <div className="relative">
            <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-lg bg-stone-800 flex items-center justify-center font-bold text-white border border-stone-700 text-sm">
              {playerBlack.avatar ? '♚' : 'B'}
            </div>
            {activeTurn === 'b' && !isGameOver && (
              <span className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-amber-400 animate-pulse" />
            )}
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="text-xs sm:text-sm font-semibold text-white tracking-wide">
                {playerBlack.name}
              </span>
              {playerBlack.title && (
                <span className="text-[10px] font-bold text-amber-400 bg-amber-950/60 px-1 rounded">
                  {playerBlack.title}
                </span>
              )}
            </div>
            {/* Captured pieces by black */}
            <div className="flex items-center gap-0.5 text-xs text-stone-300 min-h-[16px]">
              {blackCaptures.map((p, idx) => (
                <span key={idx} className="opacity-90">{pieceSymbols[p.toLowerCase()] || p}</span>
              ))}
              {whiteAdvantage < 0 && (
                <span className="text-[11px] font-bold text-emerald-400 ml-1">
                  +{Math.abs(whiteAdvantage)}
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Black Clock */}
        <div
          className={`px-3.5 py-1.5 rounded-xl font-mono text-base sm:text-lg font-bold tracking-wider backdrop-blur-md border transition-all ${
            activeTurn === 'b' && !isGameOver
              ? blackTime > 0 && blackTime <= 30
                ? 'bg-rose-950/90 text-rose-300 border-rose-500 animate-pulse'
                : 'bg-amber-950/90 text-amber-300 border-amber-500/70'
              : 'bg-stone-900/70 text-stone-300 border-white/10'
          }`}
        >
          {formatTime(blackTime)}
        </div>
      </div>

      {/* Floating Control Badges on Right Side (Camera presets & Tools) */}
      <div className="self-end flex flex-col gap-2 pointer-events-auto">
        {/* Flip 180° camera button */}
        <button
          onClick={onManualFlipCamera}
          title="Girar Tabuleiro 180° (Inverter Visão)"
          className="p-2.5 sm:p-3 rounded-xl bg-stone-900/80 hover:bg-stone-800 text-stone-200 hover:text-white border border-white/10 shadow-lg backdrop-blur-md transition-all active:scale-95 flex items-center justify-center group"
        >
          <RotateCw className="w-4 h-4 sm:w-5 sm:h-5 transition-transform group-hover:rotate-180 duration-300" />
        </button>

        {/* Auto Rotate Toggle (For 2 players on same phone) */}
        {gameMode === 'local_pass_play' && (
          <button
            onClick={onToggleAutoRotate}
            title={autoRotate ? 'Giro Automático de Turno: LIGADO' : 'Giro Automático de Turno: DESLIGADO'}
            className={`p-2.5 sm:p-3 rounded-xl border shadow-lg backdrop-blur-md transition-all active:scale-95 flex items-center justify-center ${
              autoRotate
                ? 'bg-amber-500/20 text-amber-300 border-amber-500/60'
                : 'bg-stone-900/80 text-stone-400 border-white/10'
            }`}
          >
            <span className="text-[10px] font-bold">180°</span>
          </button>
        )}

        {/* Camera Views Menu */}
        <div className="flex flex-col gap-1 p-1 bg-stone-900/85 backdrop-blur-md border border-white/10 rounded-xl shadow-lg">
          <button
            onClick={() => onSelectCameraPreset('white')}
            title="Vista Brancas"
            className="px-2 py-1.5 rounded-lg text-[10px] font-semibold text-stone-300 hover:text-white hover:bg-white/10 transition-colors"
          >
            Brancas
          </button>
          <button
            onClick={() => onSelectCameraPreset('black')}
            title="Vista Pretas"
            className="px-2 py-1.5 rounded-lg text-[10px] font-semibold text-stone-300 hover:text-white hover:bg-white/10 transition-colors"
          >
            Pretas
          </button>
          <button
            onClick={() => onSelectCameraPreset('top')}
            title="Vista Superior 2D"
            className="px-2 py-1.5 rounded-lg text-[10px] font-semibold text-stone-300 hover:text-white hover:bg-white/10 transition-colors"
          >
            Topo
          </button>
          <button
            onClick={() => onSelectCameraPreset('iso')}
            title="Vista Isométrica"
            className="px-2 py-1.5 rounded-lg text-[10px] font-semibold text-stone-300 hover:text-white hover:bg-white/10 transition-colors"
          >
            Isométrica
          </button>
        </div>

        {/* Sound Mute Toggle */}
        <button
          onClick={onToggleMute}
          title={isMuted ? 'Ativar Efeitos Sonoros' : 'Silenciar'}
          className="p-2.5 sm:p-3 rounded-xl bg-stone-900/80 hover:bg-stone-800 text-stone-300 hover:text-white border border-white/10 shadow-lg backdrop-blur-md transition-all active:scale-95 flex items-center justify-center"
        >
          {isMuted ? <VolumeX className="w-4 h-4 sm:w-5 sm:h-5 text-rose-400" /> : <Volume2 className="w-4 h-4 sm:w-5 sm:h-5" />}
        </button>
      </div>

      {/* Bottom Footer: Player White Profile, Clock & Action Toolbar */}
      <div className="space-y-2 pointer-events-auto">
        {/* Action Toolbar */}
        <div className="flex items-center justify-between gap-1.5 bg-stone-950/80 backdrop-blur-md border border-white/10 p-1.5 rounded-2xl shadow-xl">
          <div className="flex items-center gap-1">
            {/* Undo move button (vs AI or local) */}
            {canUndo && onUndoMove && (
              <button
                onClick={onUndoMove}
                title="Desfazer Último Lance"
                disabled={isGameOver}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium text-stone-300 hover:text-white hover:bg-white/10 disabled:opacity-40 transition-colors"
              >
                <Undo2 className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Desfazer</span>
              </button>
            )}

            {/* AI Hint button */}
            {onGetHint && (
              <button
                onClick={onGetHint}
                title="Pedir Sugestão de Lance à IA"
                disabled={isGameOver}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium text-amber-300 hover:text-amber-200 hover:bg-amber-500/20 disabled:opacity-40 transition-colors"
              >
                <Lightbulb className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Dica</span>
              </button>
            )}

            {/* Move History / Notation button */}
            <button
              onClick={onOpenMoveHistory}
              title="Ver Histórico de Movimentos (PGN)"
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium text-stone-300 hover:text-white hover:bg-white/10 transition-colors"
            >
              <ScrollText className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Notação</span>
            </button>
          </div>

          <div className="flex items-center gap-1">
            {/* Draw Offer */}
            <button
              onClick={onOfferDraw}
              title="Propor Empate"
              disabled={isGameOver}
              className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl text-xs font-medium text-stone-300 hover:text-white hover:bg-white/10 disabled:opacity-40 transition-colors"
            >
              <Handshake className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Empate</span>
            </button>

            {/* Resign */}
            <button
              onClick={onResign}
              title="Desistir da Partida"
              disabled={isGameOver}
              className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl text-xs font-medium text-rose-300 hover:text-rose-200 hover:bg-rose-500/20 disabled:opacity-40 transition-colors"
            >
              <Flag className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Desistir</span>
            </button>
          </div>
        </div>

        {/* White Player Profile & Clock Card */}
        <div className="flex items-center justify-between gap-2">
          {/* White Player Card */}
          <div
            className={`flex items-center gap-2.5 sm:gap-3 px-3 py-2 rounded-xl transition-all backdrop-blur-md border ${
              activeTurn === 'w' && !isGameOver
                ? 'bg-stone-900/90 border-amber-500/80 shadow-lg shadow-amber-500/10 ring-1 ring-amber-500/50'
                : 'bg-stone-900/70 border-white/10'
            }`}
          >
            <div className="relative">
              <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-lg bg-stone-100 flex items-center justify-center font-bold text-stone-900 border border-white text-sm">
                {playerWhite.avatar ? '♔' : 'W'}
              </div>
              {activeTurn === 'w' && !isGameOver && (
                <span className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-amber-400 animate-pulse" />
              )}
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="text-xs sm:text-sm font-semibold text-white tracking-wide">
                  {playerWhite.name}
                </span>
                {playerWhite.title && (
                  <span className="text-[10px] font-bold text-amber-400 bg-amber-950/60 px-1 rounded">
                    {playerWhite.title}
                  </span>
                )}
              </div>
              {/* Captured pieces by white */}
              <div className="flex items-center gap-0.5 text-xs text-stone-300 min-h-[16px]">
                {whiteCaptures.map((p, idx) => (
                  <span key={idx} className="opacity-90">{pieceSymbols[p.toLowerCase()] || p}</span>
                ))}
                {whiteAdvantage > 0 && (
                  <span className="text-[11px] font-bold text-emerald-400 ml-1">
                    +{whiteAdvantage}
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* White Clock */}
          <div
            className={`px-3.5 py-1.5 rounded-xl font-mono text-base sm:text-lg font-bold tracking-wider backdrop-blur-md border transition-all ${
              activeTurn === 'w' && !isGameOver
                ? whiteTime > 0 && whiteTime <= 30
                  ? 'bg-rose-950/90 text-rose-300 border-rose-500 animate-pulse'
                  : 'bg-amber-950/90 text-amber-300 border-amber-500/70'
                : 'bg-stone-900/70 text-stone-300 border-white/10'
            }`}
          >
            {formatTime(whiteTime)}
          </div>
        </div>
      </div>
    </div>
  );
};
