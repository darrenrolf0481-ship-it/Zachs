import React, { useState, useEffect } from "react";
import { Link2, ShieldAlert, CheckCircle2, Server, Database, Key, Eye, EyeOff, Cpu, Globe, Play } from "lucide-react";
import { AppState } from "../types";
import { cn } from "../lib/utils";
import { fetchModels } from "../lib/llmClient";

export function ConnectTab({ state, setState }: { state: AppState, setState: React.Dispatch<React.SetStateAction<AppState>> }) {
  const [connectionType, setConnectionType] = useState<"ollama" | "lm-studio" | "gemini" | "simulated">(state.connectionType);
  const [url, setUrl] = useState(state.endpoint);
  const [apiKey, setApiKey] = useState(state.apiKey || "");
  const [showKey, setShowKey] = useState(false);
  const [testing, setTesting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Update URL defaults when connection type changes
  useEffect(() => {
    if (state.isConnected) return; // Don't overwrite if already connected
    if (connectionType === "ollama") {
      setUrl("http://127.0.0.1:11434");
    } else if (connectionType === "lm-studio") {
      setUrl("http://127.0.0.1:1234");
    } else if (connectionType === "gemini") {
      setUrl("");
    } else {
      setUrl("http://127.0.0.1:11434");
    }
    setErrorMsg(null);
  }, [connectionType, state.isConnected]);

  const handleConnect = async (e: React.FormEvent) => {
    e.preventDefault();
    setTesting(true);
    setErrorMsg(null);
    
    try {
      const models = await fetchModels(connectionType, url, apiKey);
      if (models.length === 0) {
        throw new Error("No active models or personas found on this endpoint.");
      }
      setState(prev => ({
        ...prev,
        endpoint: url,
        isConnected: true,
        connectionType,
        apiKey,
        activePersonas: models
      }));
    } catch (error: any) {
      console.error(error);
      let friendlyError = error.message || "Failed to establish connection.";
      if (connectionType === "ollama") {
        friendlyError += " Make sure Ollama is running and OLLAMA_ORIGINS='*' environment variable is set to allow CORS requests from browser apps.";
      } else if (connectionType === "lm-studio") {
        friendlyError += " Ensure LM Studio local server is started and CORS is enabled in LM Studio settings.";
      }
      setErrorMsg(friendlyError);
    } finally {
      setTesting(false);
    }
  };

  const handleDisconnect = () => {
    setState(prev => ({ ...prev, isConnected: false, activePersonas: [] }));
    setErrorMsg(null);
  };

  return (
    <div className="flex h-full flex-col gap-6 p-6 overflow-y-auto pb-24 custom-scrollbar">
      <div className="flex flex-col gap-2 relative">
        <div className="flex items-center gap-2 text-xl font-display font-semibold tracking-tight">
          <Server className="text-cyan-400" />
          Server Connection
        </div>
        <p className="text-sm text-zinc-400">
          Connect to your local LLM inference server or configure a Gemini API cloud connection.
        </p>
      </div>

      {/* Connection Mode Selection */}
      {!state.isConnected && (
        <div className="grid grid-cols-2 gap-2">
          <button
            type="button"
            onClick={() => setConnectionType("ollama")}
            className={cn(
              "flex flex-col items-center justify-center p-3 rounded-2xl border text-center transition-all duration-300 gap-1.5",
              connectionType === "ollama" 
                ? "border-cyan-500/50 bg-cyan-950/20 text-cyan-400" 
                : "border-zinc-800 bg-zinc-900/20 text-zinc-400 hover:border-zinc-700"
            )}
          >
            <Database size={18} />
            <span className="text-[11px] font-bold tracking-wide">Ollama</span>
          </button>
          <button
            type="button"
            onClick={() => setConnectionType("lm-studio")}
            className={cn(
              "flex flex-col items-center justify-center p-3 rounded-2xl border text-center transition-all duration-300 gap-1.5",
              connectionType === "lm-studio" 
                ? "border-purple-500/50 bg-purple-950/20 text-purple-400" 
                : "border-zinc-800 bg-zinc-900/20 text-zinc-400 hover:border-zinc-700"
            )}
          >
            <Cpu size={18} />
            <span className="text-[11px] font-bold tracking-wide">LM Studio</span>
          </button>
          <button
            type="button"
            onClick={() => setConnectionType("gemini")}
            className={cn(
              "flex flex-col items-center justify-center p-3 rounded-2xl border text-center transition-all duration-300 gap-1.5",
              connectionType === "gemini" 
                ? "border-emerald-500/50 bg-emerald-950/20 text-emerald-400" 
                : "border-zinc-800 bg-zinc-900/20 text-zinc-400 hover:border-zinc-700"
            )}
          >
            <Globe size={18} />
            <span className="text-[11px] font-bold tracking-wide">Gemini API</span>
          </button>
          <button
            type="button"
            onClick={() => setConnectionType("simulated")}
            className={cn(
              "flex flex-col items-center justify-center p-3 rounded-2xl border text-center transition-all duration-300 gap-1.5",
              connectionType === "simulated" 
                ? "border-amber-500/50 bg-amber-950/20 text-amber-400" 
                : "border-zinc-800 bg-zinc-900/20 text-zinc-400 hover:border-zinc-700"
            )}
          >
            <Play size={18} />
            <span className="text-[11px] font-bold tracking-wide">Demo Mode</span>
          </button>
        </div>
      )}

      <div className="rounded-3xl border border-zinc-800 bg-zinc-900/40 p-5 shadow-2xl backdrop-blur-xl">
        <form onSubmit={handleConnect} className="flex flex-col gap-4">
          
          {/* Endpoint URL Input */}
          {connectionType !== "gemini" && connectionType !== "simulated" && (
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-bold tracking-widest text-zinc-500 uppercase">Endpoint URL</label>
              <div className="relative">
                <input
                  type="text"
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  disabled={state.isConnected || testing}
                  placeholder={connectionType === "ollama" ? "http://127.0.0.1:11434" : "http://127.0.0.1:1234"}
                  className="w-full rounded-xl border border-zinc-700 bg-zinc-950 px-4 py-3 pl-10 text-sm text-zinc-200 focus:border-cyan-500 focus:outline-none focus:ring-1 focus:ring-cyan-500 disabled:opacity-50"
                />
                <Link2 size={16} className="absolute left-3.5 top-3.5 text-zinc-500" />
              </div>
            </div>
          )}

          {/* Gemini API Key Input */}
          {connectionType === "gemini" && (
            <div className="flex flex-col gap-1.5">
              <div className="flex justify-between items-center">
                <label className="text-xs font-bold tracking-widest text-zinc-500 uppercase">Gemini API Key</label>
                <span className="text-[10px] text-zinc-600">Secure Client-side</span>
              </div>
              <div className="relative">
                <input
                  type={showKey ? "text" : "password"}
                  value={apiKey}
                  onChange={(e) => setApiKey(e.target.value)}
                  disabled={state.isConnected || testing}
                  placeholder="AIzaSy..."
                  className="w-full rounded-xl border border-zinc-700 bg-zinc-950 px-4 py-3 pl-10 pr-10 text-sm text-zinc-200 focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500 disabled:opacity-50 font-mono"
                />
                <Key size={16} className="absolute left-3.5 top-3.5 text-zinc-500" />
                <button
                  type="button"
                  onClick={() => setShowKey(!showKey)}
                  className="absolute right-3.5 top-3.5 text-zinc-500 hover:text-zinc-300"
                >
                  {showKey ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>
          )}

          {/* Simulated Mode Info */}
          {connectionType === "simulated" && !state.isConnected && (
            <div className="p-3 border border-amber-900/30 bg-amber-950/10 rounded-xl text-xs text-amber-200/80 leading-relaxed">
              💡 Demo Mode uses simulated offline inference models. Great for testing layouts and user flows without running any local servers or API keys.
            </div>
          )}

          {/* Action Button */}
          {!state.isConnected ? (
            <button
              type="submit"
              disabled={testing || (connectionType === "gemini" && !apiKey.trim() && !import.meta.env.VITE_GEMINI_API_KEY) || ((connectionType === "ollama" || connectionType === "lm-studio") && !url.trim())}
              className={cn(
                "flex w-full items-center justify-center gap-2 rounded-xl py-3 text-sm font-semibold text-white transition-colors disabled:bg-zinc-800 disabled:text-zinc-500",
                connectionType === "ollama" ? "bg-cyan-600 hover:bg-cyan-500" :
                connectionType === "lm-studio" ? "bg-purple-600 hover:bg-purple-500" :
                connectionType === "gemini" ? "bg-emerald-600 hover:bg-emerald-500" :
                "bg-amber-600 hover:bg-amber-500"
              )}
            >
              {testing ? (
                <>
                  <div className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                  Testing & Connecting...
                </>
              ) : (
                "Establish Connection"
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

      {/* Error Alert Box */}
      {errorMsg && (
        <div className="rounded-3xl border border-red-900/40 bg-red-950/20 p-4 flex gap-3 items-start animate-pulse">
          <ShieldAlert className="text-red-500 shrink-0 mt-0.5" size={18} />
          <div className="flex flex-col gap-1 text-xs">
            <span className="font-bold text-red-400">Connection Failed</span>
            <span className="text-zinc-400 leading-normal">{errorMsg}</span>
          </div>
        </div>
      )}

      {/* Connection Info / Telemetry Status */}
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
          <div className="flex flex-col w-full">
            <span className="text-sm font-medium text-zinc-200">
              {state.isConnected ? `Cluster Active via ${state.connectionType.toUpperCase()}` : "Not Connected"}
            </span>
            <span className="text-xs text-zinc-500 mt-1 w-full">
              {state.isConnected ? (
                <div className="flex flex-col gap-1 mt-1 w-full">
                  {state.activePersonas.map(p => (
                    <div key={p.id} className="flex items-center justify-between gap-1.5 opacity-80">
                      <div className="flex items-center gap-1.5 truncate">
                        <div className="h-1.5 w-1.5 rounded-full bg-emerald-500"></div>
                        <span className="truncate">{p.displayName}</span>
                        <span className="text-[10px] text-zinc-500 truncate">({p.modelName})</span>
                      </div>
                      <span className="font-mono text-[9px] px-1 py-0.5 bg-zinc-850 rounded text-zinc-400 shrink-0">{p.id}</span>
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

