import React from 'react';
import { X, Award, CheckCircle, Lock, Coins } from 'lucide-react';
import { Achievement } from '../../types/chess';

interface AchievementsModalProps {
  isOpen: boolean;
  onClose: () => void;
  achievements: Achievement[];
  onClaimAchievement?: (id: string) => void;
}

export const AchievementsModal: React.FC<AchievementsModalProps> = ({
  isOpen,
  onClose,
  achievements,
  onClaimAchievement,
}) => {
  if (!isOpen) return null;

  const unlockedCount = achievements.filter((a) => a.unlocked).length;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-md animate-fade-in">
      <div className="w-full max-w-xl bg-stone-900 border border-stone-800 rounded-3xl shadow-2xl flex flex-col max-h-[85vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-stone-800 bg-stone-950/60">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400">
              <Award className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-white">Conquistas Desbloqueáveis</h3>
              <p className="text-xs text-stone-400">
                {unlockedCount} de {achievements.length} conquistas desbloqueadas
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-stone-400 hover:text-white hover:bg-stone-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content list */}
        <div className="p-4 sm:p-6 overflow-y-auto space-y-3 flex-1">
          {achievements.map((ach) => (
            <div
              key={ach.id}
              className={`p-4 rounded-2xl border transition-all flex items-center justify-between gap-4 ${
                ach.unlocked
                  ? 'bg-amber-950/20 border-amber-500/40 shadow-lg shadow-amber-500/5'
                  : 'bg-stone-950/60 border-stone-800'
              }`}
            >
              <div className="flex items-center gap-3.5">
                <div
                  className={`w-11 h-11 rounded-2xl flex items-center justify-center border ${
                    ach.unlocked
                      ? 'bg-amber-500/20 border-amber-500/50 text-amber-400'
                      : 'bg-stone-800/80 border-stone-700 text-stone-500'
                  }`}
                >
                  {ach.unlocked ? <CheckCircle className="w-5 h-5" /> : <Lock className="w-4 h-4" />}
                </div>

                <div>
                  <h4 className={`text-sm font-bold ${ach.unlocked ? 'text-white' : 'text-stone-300'}`}>
                    {ach.title}
                  </h4>
                  <p className="text-xs text-stone-400 mt-0.5">{ach.description}</p>

                  <div className="flex items-center gap-2 mt-2">
                    {/* Progress Bar */}
                    <div className="w-24 h-1.5 bg-stone-800 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full ${ach.unlocked ? 'bg-amber-400' : 'bg-stone-600'}`}
                        style={{ width: `${(ach.progress / ach.maxProgress) * 100}%` }}
                      />
                    </div>
                    <span className="text-[10px] text-stone-400 font-mono">
                      {ach.progress}/{ach.maxProgress}
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-1.5 text-xs font-bold text-amber-400 bg-amber-950/60 px-2.5 py-1.5 rounded-xl border border-amber-500/20 shrink-0">
                <Coins className="w-3.5 h-3.5" />
                <span>+{ach.rewardCoins}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
