import React, { useState } from 'react';
import { X, User, Award, Shield, Target, Flame, Edit2, Check, BarChart2 } from 'lucide-react';
import { PlayerProfile } from '../../types/chess';
import { AVAILABLE_AVATARS, AVAILABLE_FRAMES, AVAILABLE_TITLES } from '../../utils/userData';

interface ProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  profile: PlayerProfile;
  onUpdateProfile: (updated: Partial<PlayerProfile>) => void;
}

export const ProfileModal: React.FC<ProfileModalProps> = ({
  isOpen,
  onClose,
  profile,
  onUpdateProfile,
}) => {
  const [activeTab, setActiveTab] = useState<'stats' | 'customize'>('stats');
  const [editingName, setEditingName] = useState(false);
  const [tempName, setTempName] = useState(profile.name);

  if (!isOpen) return null;

  const handleSaveName = () => {
    if (tempName.trim()) {
      onUpdateProfile({ name: tempName.trim() });
    }
    setEditingName(false);
  };

  const winRate = profile.totalGames > 0
    ? ((profile.wins / profile.totalGames) * 100).toFixed(1)
    : '0.0';

  const selectedAvatar = AVAILABLE_AVATARS.find((a) => a.id === profile.avatarId) || AVAILABLE_AVATARS[0];
  const selectedFrame = AVAILABLE_FRAMES.find((f) => f.id === profile.frameId) || AVAILABLE_FRAMES[0];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-md animate-fade-in">
      <div className="w-full max-w-xl bg-stone-900 border border-stone-800 rounded-3xl shadow-2xl flex flex-col max-h-[88vh] overflow-hidden">
        {/* Header with Avatar Hero */}
        <div className="relative p-6 bg-gradient-to-b from-stone-800 via-stone-900 to-stone-900 border-b border-stone-800 flex items-center justify-between">
          <div className="flex items-center gap-4">
            {/* Avatar Frame */}
            <div className={`w-16 h-16 sm:w-20 sm:h-20 rounded-2xl border-2 flex items-center justify-center bg-gradient-to-br ${selectedAvatar.color} ${selectedFrame.border} shadow-xl relative`}>
              <span className="text-2xl sm:text-3xl text-white font-black">♔</span>
            </div>

            <div>
              {editingName ? (
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    value={tempName}
                    onChange={(e) => setTempName(e.target.value)}
                    className="bg-stone-950 border border-stone-700 rounded-lg px-2.5 py-1 text-sm text-white font-bold"
                    autoFocus
                  />
                  <button
                    onClick={handleSaveName}
                    className="p-1 rounded bg-amber-500 text-stone-950"
                  >
                    <Check className="w-4 h-4" />
                  </button>
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <h3 className="text-lg sm:text-xl font-bold text-white">{profile.name}</h3>
                  <button
                    onClick={() => setEditingName(true)}
                    className="p-1 text-stone-400 hover:text-white"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              )}

              <div className="flex items-center gap-2 mt-1">
                <span className="text-xs font-bold text-amber-400 bg-amber-950/80 px-2 py-0.5 rounded border border-amber-500/30">
                  {profile.title}
                </span>
                <span className="text-xs text-stone-400 font-mono">Rating: {profile.elo} ELO</span>
              </div>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl text-stone-400 hover:text-white hover:bg-stone-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab switcher */}
        <div className="px-6 pt-3 pb-1 border-b border-stone-800/80 flex items-center gap-2">
          <button
            onClick={() => setActiveTab('stats')}
            className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all ${
              activeTab === 'stats'
                ? 'bg-amber-500 text-stone-950 shadow-md'
                : 'text-stone-400 hover:text-white hover:bg-stone-800'
            }`}
          >
            Estatísticas Detalhadas
          </button>
          <button
            onClick={() => setActiveTab('customize')}
            className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all ${
              activeTab === 'customize'
                ? 'bg-amber-500 text-stone-950 shadow-md'
                : 'text-stone-400 hover:text-white hover:bg-stone-800'
            }`}
          >
            Personalizar Avatar & Título
          </button>
        </div>

        {/* Tab content */}
        <div className="p-6 overflow-y-auto space-y-4 flex-1">
          {activeTab === 'stats' ? (
            <div className="space-y-4">
              {/* Stat Numbers Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                <div className="bg-stone-950/70 p-3.5 rounded-2xl border border-stone-800 text-center">
                  <span className="text-[11px] text-stone-400 font-medium block">Total Partidas</span>
                  <span className="text-xl font-bold text-white font-mono mt-0.5">{profile.totalGames}</span>
                </div>
                <div className="bg-stone-950/70 p-3.5 rounded-2xl border border-stone-800 text-center">
                  <span className="text-[11px] text-stone-400 font-medium block">Taxa de Vitória</span>
                  <span className="text-xl font-bold text-emerald-400 font-mono mt-0.5">{winRate}%</span>
                </div>
                <div className="bg-stone-950/70 p-3.5 rounded-2xl border border-stone-800 text-center">
                  <span className="text-[11px] text-stone-400 font-medium block">Precisão Média</span>
                  <span className="text-xl font-bold text-amber-400 font-mono mt-0.5">{profile.avgAccuracy}%</span>
                </div>
                <div className="bg-stone-950/70 p-3.5 rounded-2xl border border-stone-800 text-center">
                  <span className="text-[11px] text-stone-400 font-medium block">Recorde ELO</span>
                  <span className="text-xl font-bold text-white font-mono mt-0.5">{profile.highestElo}</span>
                </div>
              </div>

              {/* Record breakdown */}
              <div className="bg-stone-950/60 p-4 rounded-2xl border border-stone-800 space-y-2">
                <span className="text-xs font-semibold text-stone-300">Desempenho Geral</span>
                <div className="flex items-center justify-between text-xs font-semibold py-1">
                  <span className="text-emerald-400">{profile.wins} Vitórias</span>
                  <span className="text-stone-400">{profile.draws} Empates</span>
                  <span className="text-rose-400">{profile.losses} Derrotas</span>
                </div>
                <div className="h-2 w-full bg-stone-800 rounded-full flex overflow-hidden">
                  <div style={{ width: `${(profile.wins / Math.max(1, profile.totalGames)) * 100}%` }} className="bg-emerald-500" />
                  <div style={{ width: `${(profile.draws / Math.max(1, profile.totalGames)) * 100}%` }} className="bg-stone-400" />
                  <div style={{ width: `${(profile.losses / Math.max(1, profile.totalGames)) * 100}%` }} className="bg-rose-500" />
                </div>
              </div>
            </div>
          ) : (
            <div className="space-y-5">
              {/* Avatar Icon Selector */}
              <div>
                <label className="text-xs font-semibold text-stone-300 block mb-2">Ícone do Avatar</label>
                <div className="grid grid-cols-4 gap-2.5">
                  {AVAILABLE_AVATARS.map((av) => (
                    <button
                      key={av.id}
                      onClick={() => onUpdateProfile({ avatarId: av.id })}
                      className={`p-3 rounded-2xl border flex flex-col items-center gap-1 transition-all ${
                        profile.avatarId === av.id
                          ? 'bg-amber-500/20 border-amber-500'
                          : 'bg-stone-950/60 border-stone-800 hover:border-stone-700'
                      }`}
                    >
                      <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${av.color} flex items-center justify-center text-white font-bold text-sm`}>
                        ♔
                      </div>
                      <span className="text-[10px] text-stone-300 font-medium line-clamp-1">{av.name}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Frame Selector */}
              <div>
                <label className="text-xs font-semibold text-stone-300 block mb-2">Moldura de Prestígio</label>
                <div className="grid grid-cols-3 gap-2">
                  {AVAILABLE_FRAMES.map((fr) => (
                    <button
                      key={fr.id}
                      onClick={() => onUpdateProfile({ frameId: fr.id })}
                      className={`p-2.5 rounded-xl border text-xs font-semibold transition-all ${
                        profile.frameId === fr.id
                          ? 'border-amber-400 text-amber-300 bg-amber-950/40'
                          : 'border-stone-800 text-stone-400 bg-stone-950/60 hover:text-white'
                      }`}
                    >
                      {fr.name}
                    </button>
                  ))}
                </div>
              </div>

              {/* Title Selector */}
              <div>
                <label className="text-xs font-semibold text-stone-300 block mb-2">Título de Honra</label>
                <div className="grid grid-cols-2 gap-2">
                  {AVAILABLE_TITLES.map((t) => (
                    <button
                      key={t}
                      onClick={() => onUpdateProfile({ title: t })}
                      className={`p-2 rounded-xl border text-xs font-semibold text-left px-3 transition-all ${
                        profile.title === t
                          ? 'border-amber-400 text-amber-300 bg-amber-950/40'
                          : 'border-stone-800 text-stone-400 bg-stone-950/60 hover:text-white'
                      }`}
                    >
                      {t}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
