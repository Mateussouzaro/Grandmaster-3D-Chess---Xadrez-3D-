import React from 'react';
import { X, CheckCircle, ArrowRight, BookOpen, Coins, Sparkles } from 'lucide-react';
import { TUTORIAL_LESSONS } from '../../utils/tutorials';
import { TutorialLesson } from '../../types/chess';

interface TutorialModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentLessonId: number;
  completedLessonIds: number[];
  onStartLesson: (lesson: TutorialLesson) => void;
}

export const TutorialModal: React.FC<TutorialModalProps> = ({
  isOpen,
  onClose,
  currentLessonId,
  completedLessonIds,
  onStartLesson,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-md animate-fade-in">
      <div className="w-full max-w-xl bg-stone-900 border border-stone-800 rounded-3xl shadow-2xl flex flex-col max-h-[88vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-5 sm:p-6 border-b border-stone-800 bg-stone-950/60">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400">
              <BookOpen className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-white">Escola de Xadrez 3D</h3>
              <p className="text-xs text-stone-400">Aprenda a jogar com lições interativas práticas no tabuleiro</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-stone-400 hover:text-white hover:bg-stone-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Lessons List */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-3">
          {TUTORIAL_LESSONS.map((lesson) => {
            const isCompleted = completedLessonIds.includes(lesson.id);
            const isCurrent = lesson.id === currentLessonId;

            return (
              <div
                key={lesson.id}
                onClick={() => {
                  onStartLesson(lesson);
                  onClose();
                }}
                className={`group p-4 rounded-2xl border transition-all cursor-pointer flex items-center justify-between gap-4 ${
                  isCurrent
                    ? 'bg-amber-950/30 border-amber-500/50 shadow-lg shadow-amber-500/5'
                    : isCompleted
                    ? 'bg-stone-950/40 border-stone-800/80 hover:border-stone-700'
                    : 'bg-stone-950/30 border-stone-800 hover:border-amber-500/30'
                }`}
              >
                <div className="flex items-start gap-3.5">
                  <div className="mt-0.5">
                    {isCompleted ? (
                      <CheckCircle className="w-5 h-5 text-emerald-400" />
                    ) : (
                      <div className="w-5 h-5 rounded-full border-2 border-stone-600 flex items-center justify-center text-[10px] font-bold text-stone-400 group-hover:border-amber-400 group-hover:text-amber-400">
                        {lesson.id}
                      </div>
                    )}
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-white group-hover:text-amber-300 transition-colors">
                      {lesson.title}
                    </h4>
                    <p className="text-xs text-stone-400 mt-0.5 line-clamp-1">{lesson.description}</p>
                    <div className="flex items-center gap-1.5 mt-2 text-[11px] font-semibold text-amber-400">
                      <Coins className="w-3.5 h-3.5" />
                      <span>+{lesson.coinsReward} Moedas ao concluir</span>
                    </div>
                  </div>
                </div>

                <button
                  className={`p-2.5 rounded-xl border text-xs font-semibold flex items-center gap-1 shrink-0 transition-all ${
                    isCurrent
                      ? 'bg-amber-500 text-stone-950 border-amber-400'
                      : 'bg-stone-800 text-stone-200 border-stone-700 group-hover:bg-amber-500 group-hover:text-stone-950 group-hover:border-amber-400'
                  }`}
                >
                  <span>{isCompleted ? 'Revisar' : 'Praticar'}</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
