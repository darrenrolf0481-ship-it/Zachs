import React, { useState } from "react";
import { Link2, ShieldAlert, CheckCircle2, Server, Database } from "lucide-react";
import { AppState } from "../types";
import { cn } from "../lib/utils";

export function ConnectTab({ state, setState }: { state: AppState, setState: React.Dispatch<React.SetStateAction<AppState>> }) {
  const [url, setUrl] = useState(state.endpoint);
  const [testing, setTesting] = useState(false);

  const handleConnect = async (e: React.FormEvent) => {
    e.preventDefault();
    setTesting(true);
    
    // Simulate connection delay
    setTimeout(() => {
      setState(prev => ({
        ...prev,
        endpoint: url,
        isConnected: true,
        activePersonas: [
          { id: "AI-101", displayName: "Alpha", modelName: "Llama 3 (8B)", systemPrompt: "You are Alpha. Identify as AI-101." },
          { id: "AI-102", displayName: "Beta", modelName: "Mistral v0.3", systemPrompt: "You are Beta. Identify as AI-102." },
          { id: "AI-103", displayName: "Gamma", modelName: "Phi-3 Mini", systemPrompt: "You are Gamma. Identify as AI-103." }
        ]
      }));
      setTesting(false);
    }, 1500);
  };

  const handleDisconnect = () => {
    setState(prev => ({ ...prev, isConnected: false, activePersonas: [] }));
  };

  return (
    <div className="flex h-full flex-col gap-6 p-6">
      <div className="flex flex-col gap-2 relative">
        <div className="flex items-center gap-2 text-xl font-display font-semibold tracking-tight">
          <Server className="text-cyan-400" />
          Server Connection
        </div>
        <p className="text-sm text-zinc-400">
          Connect to your local inference server (Ollama, LM Studio, text-generation-webui).
        </p>
      </div>

      <div className="rounded-3xl border border-zinc-800 bg-zinc-900/40 p-5 shadow-2xl backdrop-blur-xl">
        <form onSubmit={handleConnect} className="flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-bold tracking-widest text-zinc-500 uppercase">Endpoint URL</label>
            <div className="relative">
              <input
                type="text"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                disabled={state.isConnected || testing}
                placeholder="http://127.0.0.1:11434"
                className="w-full rounded-xl border border-zinc-700 bg-zinc-950 px-4 py-3 pl-10 text-sm text-zinc-200 focus:border-cyan-500 focus:outline-none focus:ring-1 focus:ring-cyan-500 disabled:opacity-50"
              />
              <Link2 size={16} className="absolute left-3.5 top-3.5 text-zinc-500" />
            </div>
          </div>

          {!state.isConnected ? (
            <button
              type="submit"
              disabled={testing || !url.trim()}
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-cyan-600 py-3 text-sm font-semibold text-white transition-colors hover:bg-cyan-500 disabled:bg-zinc-800 disabled:text-zinc-500"
            >
              {testing ? (
                <>
                  <div className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                  Connecting...
                </>
              ) : (
                "Connect to Server"
              )}
            </button>
          ) : (
            <button
              type="button"
              onClick={handleDisconnect}
              className="flex w-full items-center justify-center gap-2 rounded-xl border border-red-900/50 bg-red-950/30 py-3 text-sm font-semibold text-red-500 transition-colors hover:bg-red-900/40"
            >
              Disconnect
            </button>
          )}
        </form>
      </div>

      <div className={cn(
        "rounded-3xl border p-5 transition-all duration-500",
        state.isConnected ? "border-emerald-900/50 bg-emerald-950/20" : "border-zinc-800 bg-zinc-900/20"
      )}>
        <div className="flex items-center gap-3">
          <div className={cn(
            "flex h-10 w-10 shrink-0 items-center justify-center rounded-full",
            state.isConnected ? "bg-emerald-500/20 text-emerald-400" : "bg-zinc-800 text-zinc-500"
          )}>
            {state.isConnected ? <CheckCircle2 size={20} /> : <ShieldAlert size={20} />}
          </div>
          <div className="flex flex-col">
            <span className="text-sm font-medium text-zinc-200">
              {state.isConnected ? "Cluster Connected Securely" : "Not Connected"}
            </span>
            <span className="text-xs text-zinc-500 mt-1">
              {state.isConnected ? (
                <div className="flex flex-col gap-1 mt-1">
                  {state.activePersonas.map(p => (
                    <div key={p.id} className="flex items-center justify-between gap-1.5 opacity-80">
                      <div className="flex items-center gap-1.5">
                        <div className="h-1.5 w-1.5 rounded-full bg-emerald-500"></div>
                        {p.displayName} <span className="text-[10px] text-zinc-500">({p.modelName})</span>
                      </div>
                      <span className="font-mono text-[9px] px-1 py-0.5 bg-zinc-800 rounded text-zinc-400">{p.id}</span>
                    </div>
                  ))}
                </div>
              ) : "No active session"}
            </span>
          </div>
        </div>
      </div>
      
      {state.isConnected && (
         <div className="mt-auto animate-pulse flex items-center justify-center gap-2 text-xs text-emerald-500">
            <Database size={12} /> Live telemetry active
         </div>
      )}
    </div>
  );
}
