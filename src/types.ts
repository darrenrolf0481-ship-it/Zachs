export type Persona = {
  id: string; // The ID number for internal recognition (e.g. AI-001)
  displayName: string;
  modelName: string; // The actual LLM name (e.g. Llama 3 (8B))
  systemPrompt: string; // The "mod file" / core instructions
};

export type AppState = {
  endpoint: string;
  isConnected: boolean;
  activePersonas: Persona[];
  isStreaming: boolean;
  connectionType: "ollama" | "lm-studio" | "gemini" | "simulated";
  apiKey?: string;
};

export type Message = {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: Date;
  personaId?: string;
  modelName?: string;
};

export type SystemStats = {
  cpuUsage: number;
  ramUsage: number;
  vramUsage: number;
  tokensPerSecond: number;
  time: string;
};
