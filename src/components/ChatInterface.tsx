import React, { useState, useRef, useEffect } from 'react';
import { Message, Persona } from '../types';
import { Send, Cpu, User, ChevronDown } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '../lib/utils';

export function ChatInterface({
  isConnected,
  activePersonas,
}: {
  isConnected: boolean;
  activePersonas: Persona[];
}) {
  const [selectedModel, setSelectedModel] = useState('all');
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      role: 'system',
      content: 'System initialized. Local LLM endpoint ready.',
      timestamp: new Date(),
    },
  ]);
  const [input, setInput] = useState('');
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || !isConnected) return;

    const newMsg: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: input,
      timestamp: new Date(),
    };
    setMessages((p) => [...p, newMsg]);
    setInput('');

    // Mock individual responses for each active persona or single selected persona
    const personasToQuery =
      selectedModel === 'all'
        ? activePersonas
        : activePersonas.filter((p) => p.id === selectedModel);
    personasToQuery.forEach((persona, idx) => {
      setTimeout(
        () => {
          setMessages((p) => [
            ...p,
            {
              id: (Date.now() + 100 * idx).toString(),
              role: 'assistant',
              content: `[${persona.displayName} / ${persona.id}] Simulated response based on mod file: "${persona.systemPrompt.substring(0, 30)}..."`,
              timestamp: new Date(),
              personaId: persona.id,
              modelName: persona.modelName,
            },
          ]);
        },
        800 + idx * 600,
      ); // Stagger the responses slightly
    });
  };

  const getModelColor = (modelName?: string) => {
    if (!modelName) return 'border-zinc-700/50 bg-zinc-800 text-zinc-200';
    if (modelName.toLowerCase().includes('llama'))
      return 'border-cyan-500/30 bg-cyan-950/20 text-cyan-50';
    if (modelName.toLowerCase().includes('mistral'))
      return 'border-purple-500/30 bg-purple-950/20 text-purple-50';
    if (modelName.toLowerCase().includes('phi'))
      return 'border-emerald-500/30 bg-emerald-950/20 text-emerald-50';
    return 'border-zinc-700/50 bg-zinc-800 text-zinc-200';
  };

  const getModelMetadata = (modelName: string) => {
    switch (modelName) {
      case 'Llama 3 (8B)':
        return { params: '8.0B', quant: 'Q4_K_M', ctx: '8k', vram: '5.8 GB', vramPercent: 48 };
      case 'Mistral v0.3':
        return { params: '7.3B', quant: 'Q5_K_M', ctx: '32k', vram: '6.2 GB', vramPercent: 52 };
      case 'Phi-3 Mini':
        return { params: '3.8B', quant: 'Q4_K_M', ctx: '4k', vram: '2.7 GB', vramPercent: 22 };
      default:
        return { params: '?', quant: '?', ctx: '?', vram: '?', vramPercent: 0 };
    }
  };

  return (
    <div className="flex h-full flex-col relative">
      {/* Top Model Selector */}
      {isConnected && activePersonas.length > 0 && (
        <div className="absolute top-0 w-full z-10 flex flex-col transition-all shadow-md">
          <div className="bg-zinc-950/90 backdrop-blur-md border-b border-zinc-800/80 px-4 py-2 flex justify-between items-center">
            <div className="text-[10px] font-bold uppercase tracking-widest text-zinc-500">
              Target Persona
            </div>
            <div className="relative">
              <select
                value={selectedModel}
                onChange={(e) => setSelectedModel(e.target.value)}
                className="appearance-none bg-zinc-900 border border-zinc-700/80 rounded-lg text-xs font-medium text-zinc-200 pl-3 pr-8 py-1.5 focus:outline-none focus:border-cyan-500/50 shadow-sm"
              >
                <option value="all">All Personas</option>
                {activePersonas.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.displayName} ({p.id})
                  </option>
                ))}
              </select>
              <ChevronDown
                size={14}
                className="absolute right-2 top-1/2 -translate-y-1/2 text-zinc-500 pointer-events-none"
              />
            </div>
          </div>
          {/* Metadata Section */}
          <AnimatePresence>
            {selectedModel !== 'all' && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                className="bg-zinc-900/95 backdrop-blur-md border-b border-zinc-800/80 px-4 py-2 overflow-hidden flex items-center gap-4 justify-end text-[10px] text-zinc-400"
              >
                {(() => {
                  const targetPersona = activePersonas.find((p) => p.id === selectedModel);
                  if (!targetPersona) return null;
                  const metadata = getModelMetadata(targetPersona.modelName);
                  return (
                    <>
                      <div className="flex gap-1 items-center">
                        <span className="font-bold text-zinc-500">PARAMS:</span>
                        <span className="text-cyan-400">{metadata.params}</span>
                      </div>
                      <div className="flex gap-1 items-center">
                        <span className="font-bold text-zinc-500">QUANT:</span>
                        <span className="text-purple-400">{metadata.quant}</span>
                      </div>
                      <div className="flex gap-1 items-center">
                        <span className="font-bold text-zinc-500">CTX:</span>
                        <span className="text-emerald-400">{metadata.ctx}</span>
                      </div>
                    </>
                  );
                })()}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      )}

      <div className="flex-1 overflow-y-auto px-4 pb-20 pt-24 custom-scrollbar">
        <div className="flex flex-col gap-4">
          <AnimatePresence>
            {selectedModel !== 'all' && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95, height: 0, marginTop: 0 }}
                animate={{ opacity: 1, scale: 1, height: 'auto', marginTop: 8 }}
                exit={{ opacity: 0, scale: 0.95, height: 0, marginTop: 0 }}
                className="rounded-2xl border border-zinc-800 bg-zinc-900/40 p-4 shadow-xl backdrop-blur-md flex items-center justify-between overflow-hidden"
              >
                <div className="flex flex-col gap-1">
                  <span className="text-[10px] font-bold tracking-widest text-zinc-500 uppercase">
                    Est. VRAM Usage
                  </span>
                  <span className="text-xl font-display font-semibold text-zinc-200">
                    {
                      getModelMetadata(
                        activePersonas.find((p) => p.id === selectedModel)?.modelName || '',
                      ).vram
                    }
                  </span>
                </div>
                {/* Circular progress bar representation */}
                <div className="relative h-12 w-12 flex items-center justify-center">
                  <svg className="h-full w-full -rotate-90 transform" viewBox="0 0 36 36">
                    <path
                      className="text-zinc-800"
                      strokeWidth="3"
                      stroke="currentColor"
                      fill="none"
                      d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                    />
                    <path
                      className="text-purple-500"
                      strokeWidth="3"
                      strokeDasharray={`${getModelMetadata(activePersonas.find((p) => p.id === selectedModel)?.modelName || '').vramPercent}, 100`}
                      strokeLinecap="round"
                      stroke="currentColor"
                      fill="none"
                      d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                    />
                  </svg>
                  <div className="absolute flex items-center justify-center text-[10px] font-bold text-zinc-300">
                    {
                      getModelMetadata(
                        activePersonas.find((p) => p.id === selectedModel)?.modelName || '',
                      ).vramPercent
                    }
                    %
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          <AnimatePresence mode="popLayout">
            {messages.map((msg) => (
              <motion.div
                layout
                key={msg.id}
                initial={{ opacity: 0, scale: 0.8, y: 20, filter: 'blur(4px)' }}
                animate={{ opacity: 1, scale: 1, y: 0, filter: 'blur(0px)' }}
                exit={{ opacity: 0, scale: 0.8 }}
                transition={{ type: 'spring', stiffness: 400, damping: 25 }}
                className={cn(
                  'flex max-w-[85%] flex-col gap-1 rounded-2xl p-3 text-sm',
                  msg.role === 'user'
                    ? 'self-end bg-zinc-700/50 text-white border border-zinc-500/20'
                    : msg.role === 'system'
                      ? 'self-center border border-zinc-800 bg-zinc-900/50 text-center text-xs text-zinc-500'
                      : `self-start border ${getModelColor(msg.modelName)}`,
                )}
              >
                {msg.role !== 'system' && (
                  <div className="flex items-center gap-1.5 opacity-60 mb-1">
                    {msg.role === 'user' ? <User size={12} /> : <Cpu size={12} />}
                    <span className="text-[10px] font-bold uppercase tracking-wider">
                      {msg.role === 'user'
                        ? 'YOU'
                        : activePersonas.find((p) => p.id === msg.personaId)?.displayName ||
                          'ASSISTANT'}
                    </span>
                  </div>
                )}
                <div className="leading-relaxed">{msg.content}</div>
              </motion.div>
            ))}
          </AnimatePresence>
          <div ref={endRef} />
        </div>
      </div>

      <div className="absolute bottom-20 left-0 w-full px-4 sm:bottom-4">
        <form onSubmit={handleSend} className="relative flex items-center">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            disabled={!isConnected}
            placeholder={isConnected ? 'Message Local LLM...' : 'Connect to endpoint first...'}
            className="w-full rounded-full border border-zinc-700 bg-zinc-900/80 py-3.5 pl-4 pr-12 text-sm text-zinc-200 shadow-xl backdrop-blur-xl transition-all focus:border-cyan-500/50 focus:outline-none focus:ring-1 focus:ring-cyan-500/50 disabled:opacity-50"
          />
          <button
            type="submit"
            disabled={!input.trim() || !isConnected}
            className="absolute right-1.5 flex h-10 w-10 items-center justify-center rounded-full bg-cyan-500/20 text-cyan-400 transition-colors hover:bg-cyan-500/40 disabled:opacity-30"
          >
            <Send size={16} />
          </button>
        </form>
      </div>
    </div>
  );
}
