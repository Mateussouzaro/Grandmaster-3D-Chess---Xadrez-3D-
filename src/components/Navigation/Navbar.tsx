import React from 'react';
import { Users, Bot, Globe, BookOpen, Eye, ShoppingBag, Trophy, User, Award, Settings } from 'lucide-react';
import { GameMode } from '../../types/chess';

interface NavbarProps {
  currentMode: GameMode;
  onSelectMode: (mode: GameMode) => void;
  playerCoins: number;
  playerElo: number;
  onOpenShop: () => void;
  onOpenLeaderboard: () => void;
  onOpenProfile: () => void;
  onOpenAchievements: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentMode,
  onSelectMode,
  playerCoins,
  playerElo,
  onOpenShop,
  onOpenLeaderboard,
  onOpenProfile,
  onOpenAchievements,
}) => {
  return (
    <header className="relative w-full bg-stone-950/90 backdrop-blur-xl border-b border-amber-500/10 px-3 sm:px-6 py-2.5 flex items-center justify-between gap-3 z-20 shadow-[0_8px_30px_rgba(0,0,0,0.22)]">
      {/* Brand Logo & Title */}
      <div className="flex items-center gap-2.5">
        <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-amber-600 to-yellow-400 flex items-center justify-center shadow-lg shadow-amber-500/20 text-stone-950 font-black text-lg">
          ♔
        </div>
        <div className="hidden xs:block">
          <h1 className="text-sm sm:text-base font-extrabold text-white tracking-tight flex items-center gap-1.5">
            <span>Grandmaster 3D</span>
            <span className="text-[10px] font-bold text-amber-400 bg-amber-950/80 px-1.5 py-0.2 rounded border border-amber-500/30 uppercase tracking-wider">
              Xadrez
            </span>
          </h1>
          <p className="text-[10px] text-stone-400 hidden sm:block">Realismo 3D · 2 Players no Celular · IA</p>
        </div>
      </div>

      {/* Modes Segmented Control */}
      <div className="flex items-center gap-1 bg-stone-900/90 p-1 rounded-xl border border-white/5 overflow-x-auto no-scrollbar">
        <button
          onClick={() => onSelectMode('local_pass_play')}
          className={`flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-lg text-xs font-semibold transition-all whitespace-nowrap ${
            currentMode === 'local_pass_play'
              ? 'bg-amber-500 text-stone-950 shadow-md font-bold'
              : 'text-stone-300 hover:text-white hover:bg-white/5'
          }`}
          title="2 Pessoas no Mesmo Celular"
        >
          <Users className="w-3.5 h-3.5" />
          <span>2 Jogadores</span>
        </button>

        <button
          onClick={() => onSelectMode('vs_ai')}
          className={`flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-lg text-xs font-semibold transition-all whitespace-nowrap ${
            currentMode === 'vs_ai'
              ? 'bg-amber-500 text-stone-950 shadow-md font-bold'
              : 'text-stone-300 hover:text-white hover:bg-white/5'
          }`}
          title="Jogar Contra a IA"
        >
          <Bot className="w-3.5 h-3.5" />
          <span>Contra IA</span>
        </button>

        <button
          onClick={() => onSelectMode('online')}
          className={`flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-lg text-xs font-semibold transition-all whitespace-nowrap ${
            currentMode === 'online'
              ? 'bg-amber-500 text-stone-950 shadow-md font-bold'
              : 'text-stone-300 hover:text-white hover:bg-white/5'
          }`}
          title="Partida Online com Chat"
        >
          <Globe className="w-3.5 h-3.5" />
          <span>Online</span>
        </button>

        <button
          onClick={() => onSelectMode('tutorial')}
          className={`flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-lg text-xs font-semibold transition-all whitespace-nowrap ${
            currentMode === 'tutorial'
              ? 'bg-amber-500 text-stone-950 shadow-md font-bold'
              : 'text-stone-300 hover:text-white hover:bg-white/5'
          }`}
          title="Tutorial Interativo"
        >
          <BookOpen className="w-3.5 h-3.5" />
          <span>Aprender</span>
        </button>

        <button
          onClick={() => onSelectMode('spectator')}
          className={`flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-lg text-xs font-semibold transition-all whitespace-nowrap ${
            currentMode === 'spectator'
              ? 'bg-amber-500 text-stone-950 shadow-md font-bold'
              : 'text-stone-300 hover:text-white hover:bg-white/5'
          }`}
          title="Assistir Partidas ao Vivo"
        >
          <Eye className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">Espectador</span>
        </button>
      </div>

      {/* Profile & Shop Badges */}
      <div className="flex items-center gap-1.5 sm:gap-2">
        {/* Shop Button */}
        <button
          onClick={onOpenShop}
          className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-stone-900 hover:bg-stone-800 border border-white/10 text-amber-300 text-xs font-bold transition-all shadow-sm active:scale-95"
          title="Loja de Cosméticos 3D"
        >
          <ShoppingBag className="w-3.5 h-3.5 text-amber-400" />
          <span className="hidden md:inline font-mono">{playerCoins}</span>
        </button>

        {/* Global Leaderboard Button */}
        <button
          onClick={onOpenLeaderboard}
          className="p-2 rounded-xl bg-stone-900 hover:bg-stone-800 border border-white/10 text-stone-300 hover:text-white transition-all active:scale-95"
          title="Rankings Globais ELO"
        >
          <Trophy className="w-4 h-4 text-amber-400" />
        </button>

        {/* Achievements Button */}
        <button
          onClick={onOpenAchievements}
          className="p-2 rounded-xl bg-stone-900 hover:bg-stone-800 border border-white/10 text-stone-300 hover:text-white transition-all active:scale-95"
          title="Conquistas"
        >
          <Award className="w-4 h-4 text-amber-400" />
        </button>

        {/* Profile Avatar Button */}
        <button
          onClick={onOpenProfile}
          className="flex items-center gap-1.5 p-1.5 sm:px-2.5 sm:py-1.5 rounded-xl bg-stone-900 hover:bg-stone-800 border border-white/10 text-white text-xs font-semibold transition-all active:scale-95"
          title="Perfil e Estatísticas"
        >
          <div className="w-6 h-6 rounded-lg bg-amber-500 text-stone-950 font-bold flex items-center justify-center text-xs">
            ♔
          </div>
          <span className="hidden lg:inline font-mono text-[11px] text-stone-300">{playerElo} ELO</span>
        </button>
      </div>
    </header>
  );
};
