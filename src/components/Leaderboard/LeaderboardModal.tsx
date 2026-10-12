import React from 'react';
import { X, Trophy, Medal, Globe, Flame } from 'lucide-react';
import { GLOBAL_LEADERBOARD } from '../../utils/userData';

interface LeaderboardModalProps {
  isOpen: boolean;
  onClose: () => void;
  playerElo: number;
}

export const LeaderboardModal: React.FC<LeaderboardModalProps> = ({
  isOpen,
  onClose,
  playerElo,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-md animate-fade-in">
      <div className="w-full max-w-xl bg-stone-900 border border-stone-800 rounded-3xl shadow-2xl flex flex-col max-h-[85vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-stone-800 bg-stone-950/60">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400">
              <Trophy className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-white">Rankings Globais ELO</h3>
              <p className="text-xs text-stone-400">Mestres mundiais e classificação internacional</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-stone-400 hover:text-white hover:bg-stone-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Leaderboard Table */}
        <div className="p-4 sm:p-6 overflow-y-auto space-y-2 flex-1">
          {GLOBAL_LEADERBOARD.map((entry) => {
            const isUser = entry.rank === 10;
            return (
              <div
                key={entry.rank}
                className={`p-3.5 rounded-2xl border transition-all flex items-center justify-between gap-3 ${
                  isUser
                    ? 'bg-amber-950/30 border-amber-500/60 shadow-lg shadow-amber-500/5'
                    : 'bg-stone-950/60 border-stone-800/80 hover:border-stone-700'
                }`}
              >
                <div className="flex items-center gap-3">
                  {/* Rank medal or number */}
                  <div className="w-7 text-center font-bold font-mono">
                    {entry.rank === 1 ? (
                      <span className="text-amber-400 text-lg">🥇</span>
                    ) : entry.rank === 2 ? (
                      <span className="text-stone-300 text-lg">🥈</span>
                    ) : entry.rank === 3 ? (
                      <span className="text-amber-600 text-lg">🥉</span>
                    ) : (
                      <span className="text-xs text-stone-400">#{entry.rank}</span>
                    )}
                  </div>

                  <div>
                    <div className="flex items-center gap-2">
                      <span className={`text-xs sm:text-sm font-bold ${isUser ? 'text-amber-300' : 'text-white'}`}>
                        {entry.name}
                      </span>
                      <span className="text-[10px] font-bold text-amber-400 bg-amber-950/60 px-1 rounded">
                        {entry.title}
                      </span>
                      <span className="text-[10px] text-stone-500">[{entry.country}]</span>
                    </div>
                    <span className="text-[11px] text-stone-400">
                      Taxa de Vitória: {entry.winRate}% · {entry.gamesPlayed} partidas
                    </span>
                  </div>
                </div>

                <div className="text-right">
                  <span className="font-mono text-sm sm:text-base font-bold text-white block">
                    {isUser ? playerElo : entry.elo}
                  </span>
                  <span className="text-[10px] text-amber-400/80 font-semibold uppercase tracking-wider">
                    Rating ELO
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
