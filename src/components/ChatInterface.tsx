import React, { useState, useRef, useEffect } from "react";
import { AppState, Message, Persona } from "../types";
import { Send, Cpu, User, ChevronDown } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { cn } from "../lib/utils";
import { chatCompletion } from "../lib/llmClient";

export function ChatInterface({ state }: { state: AppState }) {
  const { isConnected, activePersonas } = state;
  const [selectedModel, setSelectedModel] = useState("all");
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "1",
      role: "system",
      content: "System initialized. Local LLM endpoint ready.",
      timestamp: new Date(),
    }
  ]);
  const [input, setInput] = useState("");
  const [generatingPersonas, setGeneratingPersonas] = useState<string[]>([]);
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, generatingPersonas]);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || !isConnected) return;

    const userMsgContent = input.trim();
    const newMsg: Message = { id: Date.now().toString(), role: "user", content: userMsgContent, timestamp: new Date() };
    
    // Add user message to UI
    setMessages(p => [...p, newMsg]);
    setInput("");

    // Identify which personas will reply
    const personasToQuery = selectedModel === "all" 
      ? activePersonas 
      : activePersonas.filter(p => p.id === selectedModel);
      
    // Set loaders
    const queryIds = personasToQuery.map(p => p.id);
    setGeneratingPersonas(prev => [...prev, ...queryIds]);

    // Execute completion requests in parallel
    personasToQuery.forEach(async (persona) => {
      try {
        // Construct localized history for this persona thread
        const personaHistory = messages
          .concat(newMsg)
          .filter(m => m.role === "user" || m.personaId === persona.id)
          .map(m => ({
            role: m.role as "user" | "assistant" | "system",
            content: m.content
          }));

        const response = await chatCompletion(
          state.connectionType,
          state.endpoint,
          state.apiKey,
          persona.modelName,
          personaHistory,
          persona.systemPrompt
        );

        setMessages(p => [
          ...p,
          {
            id: `${Date.now()}-${persona.id}`,
            role: "assistant",
            content: response.content,
            timestamp: new Date(),
            personaId: persona.id,
            modelName: persona.modelName
          }
        ]);
      } catch (error: any) {
        console.error(`Error querying ${persona.displayName}:`, error);
        setMessages(p => [
          ...p,
          {
            id: `${Date.now()}-${persona.id}-error`,
            role: "system",
            content: `Error from ${persona.displayName}: ${error.message || error}`,
            timestamp: new Date()
          }
        ]);
      } finally {
        setGeneratingPersonas(prev => prev.filter(id => id !== persona.id));
      }
    });
  };

  const getModelColor = (modelName?: string) => {
    if (!modelName) return "border-zinc-700/50 bg-zinc-800 text-zinc-200";
    const name = modelName.toLowerCase();
    if (name.includes("llama")) return "border-cyan-500/30 bg-cyan-950/20 text-cyan-50";
    if (name.includes("mistral")) return "border-purple-500/30 bg-purple-950/20 text-purple-50";
    if (name.includes("phi")) return "border-emerald-500/30 bg-emerald-950/20 text-emerald-50";
    if (name.includes("gemini")) return "border-teal-500/30 bg-teal-950/20 text-teal-50";
    return "border-zinc-700/50 bg-zinc-900/40 text-zinc-205";
  };

  const getModelMetadata = (modelName: string) => {
    const lower = modelName.toLowerCase();
    if (lower.includes("gemini")) {
      const isPro = lower.includes("pro");
      return { 
        params: isPro ? "Advanced" : "Standard", 
        quant: "Cloud FP16", 
        ctx: isPro ? "2.0M" : "1.0M", 
        vram: "Cloud Run", 
        vramPercent: 0 
      };
    }
    if (lower.includes("70b")) {
      return { params: "70.0B", quant: "Q4_K_M", ctx: "8k", vram: "42.5 GB", vramPercent: 100 };
    }
    if (lower.includes("32b")) {
      return { params: "32.0B", quant: "Q4_K_M", ctx: "32k", vram: "20.2 GB", vramPercent: 90 };
    }
    if (lower.includes("14b") || lower.includes("13b")) {
      return { params: "14.0B", quant: "Q4_K_M", ctx: "16k", vram: "9.6 GB", vramPercent: 78 };
    }
    if (lower.includes("8b") || lower.includes("llama 3") || lower.includes("llama3")) {
      return { params: "8.0B", quant: "Q4_K_M", ctx: "8k", vram: "5.8 GB", vramPercent: 48 };
    }
    if (lower.includes("7b") || lower.includes("mistral")) {
      return { params: "7.2B", quant: "Q5_K_M", ctx: "32k", vram: "6.2 GB", vramPercent: 52 };
    }
    if (lower.includes("3b") || lower.includes("phi")) {
      return { params: "3.8B", quant: "Q4_K_M", ctx: "4k", vram: "2.7 GB", vramPercent: 22 };
    }
    return { params: "7.0B (Est)", quant: "Q4_K_M", ctx: "8k", vram: "5.5 GB", vramPercent: 45 };
  };

  return (
    <div className="flex h-full flex-col relative">
      {/* Top Model Selector */}
      {isConnected && activePersonas.length > 0 && (
        <div className="absolute top-0 w-full z-10 flex flex-col transition-all shadow-md">
          <div className="bg-zinc-950/90 backdrop-blur-md border-b border-zinc-800/80 px-4 py-2 flex justify-between items-center">
            <div className="text-[10px] font-bold uppercase tracking-widest text-zinc-500">Target Persona</div>
            <div className="relative">
              <select
                value={selectedModel}
                onChange={(e) => setSelectedModel(e.target.value)}
                className="appearance-none bg-zinc-900 border border-zinc-700/80 rounded-lg text-xs font-medium text-zinc-200 pl-3 pr-8 py-1.5 focus:outline-none focus:border-cyan-500/50 shadow-sm"
              >
                <option value="all">All Personas</option>
                {activePersonas.map(p => (
                  <option key={p.id} value={p.id}>{p.displayName} ({p.id})</option>
                ))}
              </select>
              <ChevronDown size={14} className="absolute right-2 top-1/2 -translate-y-1/2 text-zinc-500 pointer-events-none" />
            </div>
          </div>
          {/* Metadata Section */}
          <AnimatePresence>
            {selectedModel !== "all" && (
              <motion.div 
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                className="bg-zinc-900/95 backdrop-blur-md border-b border-zinc-800/80 px-4 py-2 overflow-hidden flex items-center gap-4 justify-end text-[10px] text-zinc-400"
              >
                {(() => {
                  const targetPersona = activePersonas.find(p => p.id === selectedModel);
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
            {selectedModel !== "all" && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95, height: 0, marginTop: 0 }}
                  animate={{ opacity: 1, scale: 1, height: "auto", marginTop: 8 }}
                  exit={{ opacity: 0, scale: 0.95, height: 0, marginTop: 0 }}
                  className="rounded-2xl border border-zinc-800 bg-zinc-900/40 p-4 shadow-xl backdrop-blur-md flex items-center justify-between overflow-hidden"
                >
                  <div className="flex flex-col gap-1">
                    <span className="text-[10px] font-bold tracking-widest text-zinc-500 uppercase">Est. VRAM Usage</span>
                    <span className="text-xl font-display font-semibold text-zinc-200">
                      {getModelMetadata(activePersonas.find(p => p.id === selectedModel)?.modelName || "").vram}
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
                        strokeDasharray={`${getModelMetadata(activePersonas.find(p => p.id === selectedModel)?.modelName || "").vramPercent}, 100`}
                        strokeLinecap="round"
                        stroke="currentColor"
                        fill="none"
                        d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                      />
                    </svg>
                    <div className="absolute flex items-center justify-center text-[10px] font-bold text-zinc-300">
                      {getModelMetadata(activePersonas.find(p => p.id === selectedModel)?.modelName || "").vramPercent}%
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
                initial={{ opacity: 0, scale: 0.8, y: 20, filter: "blur(4px)" }}
                animate={{ opacity: 1, scale: 1, y: 0, filter: "blur(0px)" }}
                exit={{ opacity: 0, scale: 0.8 }}
                transition={{ type: "spring", stiffness: 400, damping: 25 }}
                className={cn(
                  "flex max-w-[85%] flex-col gap-1 rounded-2xl p-3 text-sm whitespace-pre-wrap",
                  msg.role === "user" ? "self-end bg-zinc-700/50 text-white border border-zinc-500/20" : 
                  msg.role === "system" ? "self-center border border-zinc-850 bg-zinc-900/50 text-center text-[11px] text-zinc-500" :
                  `self-start border ${getModelColor(msg.modelName)}`
                )}
              >
                {msg.role !== 'system' && (
                  <div className="flex items-center gap-1.5 opacity-60 mb-1">
                    {msg.role === 'user' ? <User size={12} /> : <Cpu size={12} />}
                    <span className="text-[10px] font-bold uppercase tracking-wider">
                      {msg.role === 'user' ? 'YOU' : (activePersonas.find(p => p.id === msg.personaId)?.displayName || 'ASSISTANT')}
                    </span>
                  </div>
                )}
                <div className="leading-relaxed">{msg.content}</div>
              </motion.div>
            ))}
          </AnimatePresence>

          {/* Active Generation thinking bubbles */}
          {generatingPersonas.length > 0 && (
            <div className="flex flex-col gap-3">
              {generatingPersonas.map((personaId) => {
                const persona = activePersonas.find(p => p.id === personaId);
                if (!persona) return null;
                return (
                  <div
                    key={`thinking-${personaId}`}
                    className={cn(
                      "flex max-w-[85%] self-start flex-col gap-1 rounded-2xl p-3 border text-sm animate-pulse",
                      getModelColor(persona.modelName)
                    )}
                  >
                    <div className="flex items-center gap-1.5 opacity-60 mb-1">
                      <Cpu size={12} className="animate-spin text-zinc-400" />
                      <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-400">
                        {persona.displayName}
                      </span>
                    </div>
                    <div className="flex gap-1 items-center py-1 px-1">
                      <span className="h-1.5 w-1.5 rounded-full bg-zinc-450 animate-bounce [animation-delay:-0.3s]"></span>
                      <span className="h-1.5 w-1.5 rounded-full bg-zinc-450 animate-bounce [animation-delay:-0.15s]"></span>
                      <span className="h-1.5 w-1.5 rounded-full bg-zinc-450 animate-bounce"></span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          <div ref={endRef} />
        </div>
      </div>

      <div className="absolute bottom-20 left-0 w-full px-4 sm:bottom-4">
        <form onSubmit={handleSend} className="relative flex items-center">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            disabled={!isConnected || generatingPersonas.length > 0}
            placeholder={
              !isConnected ? "Connect to endpoint first..." :
              generatingPersonas.length > 0 ? "Waiting for responses..." :
              "Message Local LLM..."
            }
            className="w-full rounded-full border border-zinc-700 bg-zinc-900/80 py-3.5 pl-4 pr-12 text-sm text-zinc-200 shadow-xl backdrop-blur-xl transition-all focus:border-cyan-500/50 focus:outline-none focus:ring-1 focus:ring-cyan-500/50 disabled:opacity-50"
          />
          <button
            type="submit"
            disabled={!input.trim() || !isConnected || generatingPersonas.length > 0}
            className="absolute right-1.5 flex h-10 w-10 items-center justify-center rounded-full bg-cyan-500/20 text-cyan-400 transition-colors hover:bg-cyan-500/40 disabled:opacity-30"
          >
            <Send size={16} />
          </button>
        </form>
      </div>
    </div>
  );
}

