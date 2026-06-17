import React, { useState } from 'react';
import { DeviceFrame } from './components/DeviceFrame';
import { AppState } from './types';
import { ConnectTab } from './components/ConnectTab';
import { VizDashboard } from './components/VizDashboard';
import { ChatInterface } from './components/ChatInterface';
import { PersonasTab } from './components/PersonasTab';
import { Activity, MessageSquare, Network, Wifi, Terminal, Users } from 'lucide-react';
import { cn } from './lib/utils';

export default function App() {
  const [activeTab, setActiveTab] = useState<'connect' | 'viz' | 'chat' | 'personas'>('connect');
  const [state, setState] = useState<AppState>({
    endpoint: 'http://127.0.0.1:11434',
    isConnected: false,
    activePersonas: [],
    isStreaming: false,
  });
  const [theme, setTheme] = useState<'default' | 'terminal'>('default');

  return (
    <div className={theme === 'terminal' ? 'theme-terminal h-full w-full' : 'h-full w-full'}>
      <DeviceFrame>
        {/* Top Status Bar (Mocked Android Status) */}
        <div className="flex w-full items-center justify-between px-6 py-3 text-[10px] font-medium tracking-wider text-zinc-500 relative z-20">
          <div className="flex items-center gap-1">
            <span className="font-display text-zinc-200">LLM_CONNECT</span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setTheme((t) => (t === 'default' ? 'terminal' : 'default'))}
              className="mr-2 hover:text-zinc-200 transition-colors flex items-center justify-center p-1 rounded-sm bg-zinc-800/50"
              title="Toggle Terminal Theme"
            >
              <Terminal size={12} className={theme === 'terminal' ? 'text-cyan-400' : ''} />
            </button>
            {state.isConnected && <span className="text-emerald-500 mr-2">ONLINE</span>}
            <Wifi size={12} className={state.isConnected ? 'text-cyan-400' : ''} />
            <span>100%</span>
          </div>
        </div>

        {/* Main Content Area */}
        <div className="flex-1 overflow-hidden relative">
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-cyan-900/10 via-zinc-950 to-zinc-950" />
          <div className="h-full w-full relative z-10">
            {activeTab === 'connect' && <ConnectTab state={state} setState={setState} />}
            {activeTab === 'viz' && <VizDashboard isConnected={state.isConnected} />}
            {activeTab === 'chat' && (
              <ChatInterface
                isConnected={state.isConnected}
                activePersonas={state.activePersonas}
              />
            )}
            {activeTab === 'personas' && <PersonasTab state={state} setState={setState} />}
          </div>
        </div>

        {/* Bottom Navigation (Android App Style) */}
        <div className="relative z-20 flex w-full justify-between items-center bg-zinc-900/80 px-6 pb-6 pt-4 backdrop-blur-xl border-t border-zinc-800">
          <NavButton
            icon={<Network size={20} />}
            label="Network"
            active={activeTab === 'connect'}
            onClick={() => setActiveTab('connect')}
          />
          <NavButton
            icon={<Activity size={20} />}
            label="Metrics"
            active={activeTab === 'viz'}
            onClick={() => setActiveTab('viz')}
          />
          <NavButton
            icon={<MessageSquare size={20} />}
            label="Interact"
            active={activeTab === 'chat'}
            onClick={() => setActiveTab('chat')}
          />
          <NavButton
            icon={<Users size={20} />}
            label="Personas"
            active={activeTab === 'personas'}
            onClick={() => setActiveTab('personas')}
          />
        </div>
      </DeviceFrame>
    </div>
  );
}

function NavButton({
  icon,
  label,
  active,
  onClick,
}: {
  icon: React.ReactNode;
  label: string;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={cn(
        'flex flex-col items-center gap-1 transition-colors duration-300 w-16',
        active ? 'text-cyan-400' : 'text-zinc-500 hover:text-zinc-300',
      )}
    >
      <div
        className={cn(
          'flex h-8 w-14 items-center justify-center rounded-2xl transition-all duration-300',
          active ? 'bg-cyan-500/15' : 'bg-transparent',
        )}
      >
        {icon}
      </div>
      <span className="text-[10px] font-semibold">{label}</span>
    </button>
  );
}
