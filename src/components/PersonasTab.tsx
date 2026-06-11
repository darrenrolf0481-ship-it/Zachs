import React from "react";
import { AppState, Persona } from "../types";
import { Users, Save, Cpu } from "lucide-react";
import { cn } from "../lib/utils";

export function PersonasTab({ state, setState }: { state: AppState, setState: React.Dispatch<React.SetStateAction<AppState>> }) {
  const updatePersona = (id: string, updates: Partial<Persona>) => {
    setState(prev => ({
      ...prev,
      activePersonas: prev.activePersonas.map(p => p.id === id ? { ...p, ...updates } : p)
    }));
  };

  if (!state.isConnected) {
    return (
      <div className="flex h-full flex-col items-center justify-center p-6 text-center">
        <Users size={48} className="mb-4 text-zinc-700" />
        <h2 className="mb-2 text-xl font-display font-semibold text-zinc-300">Identity Drift Protection</h2>
        <p className="text-sm text-zinc-500">Connect to a server first to configure mod files and personas.</p>
      </div>
    );
  }

  return (
    <div className="flex h-full flex-col gap-6 p-6 overflow-y-auto custom-scrollbar pb-24">
      <div className="flex flex-col gap-2 relative">
        <div className="flex items-center gap-2 text-xl font-display font-semibold tracking-tight">
          <Users className="text-cyan-400" />
          Persona Configuration
        </div>
        <p className="text-sm text-zinc-400">
          Set up Identity Drift Protection. Ensure each model recognizes its ID # and has the correct Mod File (System Prompt).
        </p>
      </div>

      <div className="flex flex-col gap-4">
        {state.activePersonas.map((persona) => (
          <div key={persona.id} className="flex flex-col gap-3 rounded-2xl border border-zinc-800 bg-zinc-900/40 p-4 shadow-xl backdrop-blur-md">
            
            <div className="flex gap-4">
              <div className="flex-1 flex flex-col gap-1.5">
                <label className="text-[10px] font-bold tracking-widest text-zinc-500 uppercase">Display Name (You see)</label>
                <input
                  type="text"
                  value={persona.displayName}
                  onChange={(e) => updatePersona(persona.id, { displayName: e.target.value })}
                  className="w-full rounded-lg border border-zinc-700 bg-zinc-950 px-3 py-2 text-sm text-zinc-200 focus:border-cyan-500 focus:outline-none"
                />
              </div>

              <div className="flex-1 flex flex-col gap-1.5">
                <label className="text-[10px] font-bold tracking-widest text-zinc-500 uppercase">Internal ID (They see)</label>
                <input
                  type="text"
                  value={persona.id}
                  disabled
                  className="w-full rounded-lg border border-zinc-800 bg-zinc-900 px-3 py-2 text-sm text-zinc-500 font-mono"
                />
              </div>
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-[10px] font-bold tracking-widest text-zinc-500 uppercase flex items-center gap-1"><Cpu size={12}/> Target Model</label>
              <input
                type="text"
                value={persona.modelName}
                disabled
                className="w-full rounded-lg border border-zinc-800 bg-zinc-900 px-3 py-2 text-sm text-emerald-500/70 font-mono"
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-[10px] font-bold tracking-widest text-zinc-500 uppercase">Mod File / System Prompt</label>
              <textarea
                value={persona.systemPrompt}
                onChange={(e) => updatePersona(persona.id, { systemPrompt: e.target.value })}
                rows={3}
                className="w-full rounded-lg border border-zinc-700 bg-zinc-950 px-3 py-2 text-xs font-mono text-zinc-300 focus:border-purple-500 focus:outline-none resize-none"
              />
            </div>

          </div>
        ))}
      </div>
    </div>
  );
}
