import React, { useState } from 'react';
import { X, Users, Globe2, Copy, Check, Send, Sparkles, MessageSquare } from 'lucide-react';
import { ChatMessage, PieceColor } from '../../types/chess';

interface OnlineLobbyModalProps {
  isOpen: boolean;
  onClose: () => void;
  roomCode: string;
  isOnlineActive: boolean;
  onStartOnlineMatch: (code: string) => void;
  chatMessages: ChatMessage[];
  onSendMessage: (text: string) => void;
  myColor: PieceColor;
}

export const OnlineLobbyModal: React.FC<OnlineLobbyModalProps> = ({
  isOpen,
  onClose,
  roomCode,
  isOnlineActive,
  onStartOnlineMatch,
  chatMessages,
  onSendMessage,
  myColor,
}) => {
  const [inputCode, setInputCode] = useState('');
  const [chatInput, setChatInput] = useState('');
  const [copiedCode, setCopiedCode] = useState(false);
  const [isSearching, setIsSearching] = useState(false);

  if (!isOpen) return null;

  const handleCopyCode = () => {
    navigator.clipboard.writeText(roomCode);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2000);
  };

  const handleSendChat = (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatInput.trim()) return;
    onSendMessage(chatInput.trim());
    setChatInput('');
  };

  const quickPhrases = ['Boa jogada! 👏', 'Obrigado! 🤝', 'Belo xeque! ⚡', 'Boa sorte! ♟️', 'Foi por pouco! 😅'];

  const handleQuickMatch = () => {
    setIsSearching(true);
    setTimeout(() => {
      setIsSearching(false);
      const generated = `CHESS-${Math.floor(1000 + Math.random() * 9000)}`;
      onStartOnlineMatch(generated);
    }, 1200);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-md animate-fade-in">
      <div className="w-full max-w-lg bg-stone-900 border border-stone-800 rounded-3xl shadow-2xl flex flex-col max-h-[88vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-stone-800 bg-stone-950/60">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-500/10 border border-blue-500/30 flex items-center justify-center text-blue-400">
              <Globe2 className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-white">Partida Online & Chat</h3>
              <p className="text-xs text-stone-400">Jogue com amigos em tempo real com código de sala</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-stone-400 hover:text-white hover:bg-stone-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-5 sm:p-6 space-y-5 overflow-y-auto flex-1">
          {/* Quick Matchmaking & Room Code */}
          <div className="space-y-3">
            <div className="bg-stone-950/80 p-4 rounded-2xl border border-stone-800 space-y-3">
              <span className="text-xs font-semibold text-stone-400 block">Sua Sala Atual</span>
              <div className="flex items-center justify-between bg-stone-900 px-3.5 py-2.5 rounded-xl border border-stone-700">
                <span className="font-mono text-sm sm:text-base font-bold text-amber-400">
                  {roomCode}
                </span>
                <button
                  onClick={handleCopyCode}
                  className="flex items-center gap-1.5 px-3 py-1 rounded-lg bg-stone-800 hover:bg-stone-700 text-stone-200 text-xs transition-colors"
                >
                  {copiedCode ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedCode ? 'Copiado!' : 'Copiar'}</span>
                </button>
              </div>

              <div className="grid grid-cols-2 gap-2 pt-1">
                <button
                  onClick={handleQuickMatch}
                  disabled={isSearching}
                  className="w-full py-2.5 px-3 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-semibold text-xs transition-all flex items-center justify-center gap-1.5 shadow-lg shadow-blue-500/20"
                >
                  <Users className="w-3.5 h-3.5" />
                  <span>{isSearching ? 'Buscando...' : 'Partida Rápida'}</span>
                </button>

                <div className="flex items-center gap-1">
                  <input
                    type="text"
                    value={inputCode}
                    onChange={(e) => setInputCode(e.target.value.toUpperCase())}
                    placeholder="CHESS-XXXX"
                    className="w-full bg-stone-900 border border-stone-700 rounded-xl px-2.5 py-2 text-xs text-white placeholder-stone-500 focus:outline-none focus:border-blue-500 font-mono"
                  />
                  <button
                    onClick={() => {
                      if (inputCode.trim()) {
                        onStartOnlineMatch(inputCode.trim());
                      }
                    }}
                    className="py-2 px-3 rounded-xl bg-stone-800 hover:bg-stone-700 text-white text-xs font-semibold shrink-0"
                  >
                    Entrar
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Live In-Game Chat Box */}
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-xs font-semibold text-stone-300">
              <MessageSquare className="w-3.5 h-3.5 text-blue-400" />
              <span>Chat em Tempo Real</span>
            </div>

            <div className="bg-stone-950/80 rounded-2xl border border-stone-800 flex flex-col h-48 overflow-hidden">
              {/* Message log */}
              <div className="flex-1 p-3 overflow-y-auto space-y-2 text-xs">
                {chatMessages.length === 0 ? (
                  <div className="text-center py-10 text-stone-500">
                    Nenhuma mensagem ainda. Envie uma saudação!
                  </div>
                ) : (
                  chatMessages.map((msg) => (
                    <div
                      key={msg.id}
                      className={`flex flex-col ${msg.isSystem ? 'items-center text-center' : 'items-start'}`}
                    >
                      {msg.isSystem ? (
                        <span className="text-[10px] text-amber-400/80 bg-amber-950/40 px-2 py-0.5 rounded-full">
                          {msg.text}
                        </span>
                      ) : (
                        <div className="bg-stone-900 px-3 py-1.5 rounded-xl border border-stone-800 max-w-[85%]">
                          <span className="text-[10px] font-bold text-amber-400 block mb-0.5">
                            {msg.senderName}
                          </span>
                          <span className="text-stone-200">{msg.text}</span>
                        </div>
                      )}
                    </div>
                  ))
                )}
              </div>

              {/* Quick Preset Buttons */}
              <div className="px-2 py-1.5 bg-stone-900/60 border-t border-stone-800/80 flex gap-1.5 overflow-x-auto no-scrollbar">
                {quickPhrases.map((phrase, idx) => (
                  <button
                    key={idx}
                    onClick={() => onSendMessage(phrase)}
                    className="whitespace-nowrap px-2 py-1 rounded-lg bg-stone-800 hover:bg-stone-700 text-[11px] text-stone-300 transition-colors"
                  >
                    {phrase}
                  </button>
                ))}
              </div>

              {/* Chat Input form */}
              <form onSubmit={handleSendChat} className="p-2 bg-stone-900 border-t border-stone-800 flex items-center gap-2">
                <input
                  type="text"
                  value={chatInput}
                  onChange={(e) => setChatInput(e.target.value)}
                  placeholder="Digite sua mensagem..."
                  className="flex-1 bg-stone-950 border border-stone-800 rounded-xl px-3 py-1.5 text-xs text-white placeholder-stone-500 focus:outline-none focus:border-amber-500"
                />
                <button
                  type="submit"
                  disabled={!chatInput.trim()}
                  className="p-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-stone-950 disabled:opacity-40 transition-colors"
                >
                  <Send className="w-3.5 h-3.5" />
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
