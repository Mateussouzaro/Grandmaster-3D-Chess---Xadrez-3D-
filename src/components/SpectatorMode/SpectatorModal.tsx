import React from 'react';
import { X, Eye, Flame, Trophy, Play, Users } from 'lucide-react';
import { LIVE_SPECTATOR_MATCHES } from '../../utils/userData';
import { SpectatorMatch } from '../../types/chess';

interface SpectatorModalProps {
  isOpen: boolean;
  onClose: () => void;
  onWatchMatch: (match: SpectatorMatch) => void;
}

export const SpectatorModal: React.FC<SpectatorModalProps> = ({
  isOpen,
  onClose,
  onWatchMatch,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-md animate-fade-in">
      <div className="w-full max-w-xl bg-stone-900 border border-stone-800 rounded-3xl shadow-2xl flex flex-col max-h-[85vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-stone-800 bg-stone-950/60">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-purple-500/10 border border-purple-500/30 flex items-center justify-center text-purple-400">
              <Eye className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-white">Modo Espectador</h3>
              <p className="text-xs text-stone-400">Assista a partidas ao vivo em 3D de grandes mestres e jogadores</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-stone-400 hover:text-white hover:bg-stone-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Live Matches List */}
        <div className="p-4 sm:p-6 overflow-y-auto space-y-3.5 flex-1">
          {LIVE_SPECTATOR_MATCHES.map((match) => (
            <div
              key={match.id}
              className="p-4 rounded-2xl bg-stone-950/70 border border-stone-800/80 hover:border-purple-500/40 transition-all flex flex-col gap-3 group"
            >
              <div className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-1.5 text-rose-400 font-semibold">
                  <span className="w-2 h-2 rounded-full bg-rose-500 animate-ping" />
                  <span>AO VIVO</span>
                  <span className="text-stone-500 font-normal">· {match.timeControl}</span>
                </div>
                <div className="flex items-center gap-1 text-stone-400">
                  <Users className="w-3.5 h-3.5" />
                  <span>{match.spectatorsCount} assistindo</span>
                </div>
              </div>

              {/* Matchup Banner */}
              <div className="flex items-center justify-between gap-3 bg-stone-900/80 p-3 rounded-xl border border-stone-800">
                {/* White Player */}
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-lg bg-stone-100 text-stone-900 font-bold flex items-center justify-center text-xs">
                    ♔
                  </div>
                  <div>
                    <div className="flex items-center gap-1">
                      <span className="text-xs font-bold text-white">{match.whitePlayer.name}</span>
                      <span className="text-[10px] font-bold text-amber-400 bg-amber-950/60 px-1 rounded">
                        {match.whitePlayer.title}
                      </span>
                    </div>
                    <span className="text-[11px] text-stone-400 font-mono">{match.whitePlayer.elo} ELO</span>
                  </div>
                </div>

                <div className="text-xs font-bold text-stone-500">VS</div>

                {/* Black Player */}
                <div className="flex items-center gap-2.5 text-right">
                  <div>
                    <div className="flex items-center justify-end gap-1">
                      <span className="text-[10px] font-bold text-amber-400 bg-amber-950/60 px-1 rounded">
                        {match.blackPlayer.title}
                      </span>
                      <span className="text-xs font-bold text-white">{match.blackPlayer.name}</span>
                    </div>
                    <span className="text-[11px] text-stone-400 font-mono">{match.blackPlayer.elo} ELO</span>
                  </div>
                  <div className="w-8 h-8 rounded-lg bg-stone-800 text-white font-bold flex items-center justify-center text-xs border border-stone-700">
                    ♚
                  </div>
                </div>
              </div>

              {/* Action Button */}
              <div className="flex items-center justify-between pt-1">
                <span className="text-[11px] text-stone-400">
                  Vantagem de análise: <strong className={match.evalAdvantage >= 0 ? 'text-emerald-400' : 'text-amber-400'}>
                    {match.evalAdvantage >= 0 ? `+${match.evalAdvantage}` : match.evalAdvantage}
                  </strong>
                </span>

                <button
                  onClick={() => {
                    onWatchMatch(match);
                    onClose();
                  }}
                  className="px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-semibold text-xs transition-all flex items-center gap-1.5 shadow-lg shadow-purple-500/20 active:scale-95"
                >
                  <Play className="w-3.5 h-3.5 fill-current" />
                  <span>Assistir em 3D</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
