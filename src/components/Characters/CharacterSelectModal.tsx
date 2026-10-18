import React from 'react';
import { Check, Sparkles, X } from 'lucide-react';
import { CHESS_CHARACTERS, ChessCharacter } from '../../data/characters';

interface CharacterSelectModalProps {
  isOpen: boolean;
  selectedId: string;
  onSelect: (character: ChessCharacter) => void;
  onClose: () => void;
}

export function CharacterSelectModal({ isOpen, selectedId, onSelect, onClose }: CharacterSelectModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 p-4 backdrop-blur-sm" role="dialog" aria-modal="true" aria-labelledby="character-title">
      <div className="max-h-[90vh] w-full max-w-4xl overflow-hidden rounded-3xl border border-amber-400/25 bg-stone-950 shadow-2xl shadow-black/50">
        <div className="relative border-b border-white/10 bg-gradient-to-r from-slate-950 via-stone-900 to-slate-950 p-5">
          <button onClick={onClose} className="absolute right-4 top-4 rounded-full p-2 text-stone-400 hover:bg-white/10 hover:text-white" aria-label="Fechar seleção"><X className="h-5 w-5" /></button>
          <div className="max-w-xl">
            <p className="mb-1 text-[10px] font-bold uppercase tracking-[0.28em] text-amber-400">Duelo de mestres</p>
            <h2 id="character-title" className="text-2xl font-black text-white">Escolha quem vai jogar</h2>
            <p className="mt-1 text-sm text-stone-400">Cada personagem traz uma especialidade para deixar o confronto mais estratégico.</p>
          </div>
          <img src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/images%20%283%29-dNg3f3x3qZRzV9uzvZIKIucJvMlpVJ.jpeg" alt="Dois jogadores sentados concentrados diante de um tabuleiro de xadrez" className="mt-4 h-24 w-full rounded-2xl object-cover object-center opacity-70 sm:absolute sm:right-5 sm:top-5 sm:mt-0 sm:w-52" />
        </div>
        <div className="grid max-h-[58vh] gap-3 overflow-y-auto p-4 sm:grid-cols-2 lg:grid-cols-3">
          {CHESS_CHARACTERS.map((character) => {
            const isSelected = character.id === selectedId;
            return (
              <button key={character.id} onClick={() => onSelect(character)} className={`group rounded-2xl border p-4 text-left transition-all hover:-translate-y-0.5 hover:border-amber-400/60 ${isSelected ? 'border-amber-400 bg-amber-400/10 shadow-lg shadow-amber-500/10' : 'border-white/10 bg-white/[0.03] hover:bg-white/[0.06]'}`}>
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <span className="flex h-11 w-11 items-center justify-center rounded-2xl text-lg font-black text-stone-950" style={{ backgroundColor: character.color }}>{character.initials}</span>
                    <div><h3 className="font-bold text-white">{character.name}</h3><p className="text-[11px] text-amber-300">{character.role}</p></div>
                  </div>
                  {isSelected ? <Check className="h-5 w-5 text-amber-400" /> : <Sparkles className="h-4 w-4 text-stone-600 group-hover:text-amber-300" />}
                </div>
                <p className="mt-3 text-xs font-semibold text-stone-200">{character.specialty}</p>
                <p className="mt-1 text-xs leading-relaxed text-stone-400">{character.bonus}</p>
              </button>
            );
          })}
        </div>
        <div className="flex items-center justify-between border-t border-white/10 px-5 py-4">
          <span className="text-xs text-stone-500">A escolha pode ser alterada a qualquer momento.</span>
          <button onClick={onClose} className="rounded-xl bg-amber-400 px-4 py-2 text-sm font-bold text-stone-950 transition hover:bg-amber-300">Confirmar personagem</button>
        </div>
      </div>
    </div>
  );
}
