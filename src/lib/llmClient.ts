import { Persona } from "../types";

export interface ChatMessage {
  role: "user" | "assistant" | "system";
  content: string;
}

export async function fetchModels(
  connectionType: "ollama" | "lm-studio" | "gemini" | "simulated",
  endpoint: string,
  apiKey?: string
): Promise<Persona[]> {
  if (connectionType === "simulated") {
    return [
      { id: "AI-101", displayName: "Alpha", modelName: "Llama 3 (8B)", systemPrompt: "You are Alpha, a helpful AI assistant. Identify as AI-101." },
      { id: "AI-102", displayName: "Beta", modelName: "Mistral v0.3", systemPrompt: "You are Beta, a logical AI assistant. Identify as AI-102." },
      { id: "AI-103", displayName: "Gamma", modelName: "Phi-3 Mini", systemPrompt: "You are Gamma, a creative AI assistant. Identify as AI-103." }
    ];
  }

  if (connectionType === "gemini") {
    // Standard Gemini Models
    return [
      { id: "GEMINI-01", displayName: "Flash", modelName: "gemini-2.5-flash", systemPrompt: "You are Flash, a fast and efficient assistant. Identify as GEMINI-01." },
      { id: "GEMINI-02", displayName: "Pro", modelName: "gemini-2.5-pro", systemPrompt: "You are Pro, a highly advanced reasoning assistant. Identify as GEMINI-02." }
    ];
  }

  const cleanEndpoint = endpoint.replace(/\/$/, "");

  if (connectionType === "ollama") {
    try {
      const response = await fetch(`${cleanEndpoint}/api/tags`);
      if (!response.ok) {
        throw new Error(`Ollama returned status ${response.status}`);
      }
      const data = await response.json();
      if (!data.models || !Array.isArray(data.models)) {
        throw new Error("Invalid response format from Ollama");
      }
      return data.models.map((model: any, index: number) => {
        const id = `AI-${100 + index + 1}`;
        const name = model.name;
        // Parse a nice display name
        const displayName = name.split(":")[0].replace(/[-_]/g, " ").replace(/\b\w/g, (c: string) => c.toUpperCase());
        return {
          id,
          displayName,
          modelName: name,
          systemPrompt: `You are ${displayName}, a local AI model powered by Ollama. Identify as ${id}.`
        };
      });
    } catch (error: any) {
      console.error("Failed to fetch Ollama models:", error);
      throw new Error(`Could not connect to Ollama: ${error.message || error}`);
    }
  }

  if (connectionType === "lm-studio") {
    try {
      const response = await fetch(`${cleanEndpoint}/v1/models`);
      if (!response.ok) {
        throw new Error(`LM Studio returned status ${response.status}`);
      }
      const data = await response.json();
      if (!data.data || !Array.isArray(data.data)) {
        throw new Error("Invalid response format from LM Studio");
      }
      return data.data.map((model: any, index: number) => {
        const id = `AI-${100 + index + 1}`;
        const name = model.id;
        const displayName = name.split("/").pop()?.replace(/[-_]/g, " ").replace(/\b\w/g, (c: string) => c.toUpperCase()) || name;
        return {
          id,
          displayName,
          modelName: name,
          systemPrompt: `You are ${displayName}, a local AI model running on LM Studio. Identify as ${id}.`
        };
      });
    } catch (error: any) {
      console.error("Failed to fetch LM Studio models:", error);
      throw new Error(`Could not connect to LM Studio: ${error.message || error}`);
    }
  }

  return [];
}

export async function chatCompletion(
  connectionType: "ollama" | "lm-studio" | "gemini" | "simulated",
  endpoint: string,
  apiKey: string | undefined,
  modelName: string,
  messages: ChatMessage[],
  systemPrompt: string
): Promise<{ content: string; tps?: number }> {
  if (connectionType === "simulated") {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({
          content: `[Simulated Response] Based on System Prompt: "${systemPrompt.substring(0, 40)}...". I am running model ${modelName}.`,
          tps: Math.round(25 + Math.random() * 15)
        });
      }, 1000);
    });
  }

  const cleanEndpoint = endpoint.replace(/\/$/, "");

  if (connectionType === "gemini") {
    const key = apiKey || import.meta.env.VITE_GEMINI_API_KEY || "";
    if (!key) {
      throw new Error("Gemini API key is required. Set it in .env.local or enter it in the connection tab.");
    }
    const startTime = Date.now();
    try {
      // Map ChatMessage structure to Gemini API structure
      const contents = messages.map(msg => ({
        role: msg.role === "user" ? "user" : "model",
        parts: [{ text: msg.content }]
      }));

      const body: any = {
        contents,
      };

      if (systemPrompt) {
        body.systemInstruction = {
          parts: [{ text: systemPrompt }]
        };
      }

      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/${modelName}:generateContent?key=${key}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(body)
        }
      );

      if (!response.ok) {
        const errData = await response.json().catch(() => ({}));
        throw new Error(errData.error?.message || `Gemini API returned status ${response.status}`);
      }

      const data = await response.json();
      const content = data.candidates?.[0]?.content?.parts?.[0]?.text || "No response generated.";
      const durationSec = (Date.now() - startTime) / 1000;
      // Estimate tokens per second (4 chars ~ 1 token)
      const tokenCount = content.length / 4;
      const tps = Math.round(tokenCount / durationSec);

      return { content, tps };
    } catch (error: any) {
      console.error("Gemini API Call Failed:", error);
      throw new Error(`Gemini API error: ${error.message || error}`);
    }
  }

  if (connectionType === "ollama") {
    const startTime = Date.now();
    try {
      // Ollama uses chat format
      const formattedMessages = [
        ...(systemPrompt ? [{ role: "system", content: systemPrompt }] : []),
        ...messages
      ];

      const response = await fetch(`${cleanEndpoint}/api/chat`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: modelName,
          messages: formattedMessages,
          stream: false
        })
      });

      if (!response.ok) {
        throw new Error(`Ollama returned status ${response.status}`);
      }

      const data = await response.json();
      const content = data.message?.content || "";
      const durationSec = (Date.now() - startTime) / 1000;
      // Use Ollama's stats or fallback
      const tokenCount = data.eval_count || (content.length / 4);
      const tps = Math.round(tokenCount / durationSec);

      return { content, tps };
    } catch (error: any) {
      console.error("Ollama Chat API Call Failed:", error);
      throw new Error(`Ollama Chat error: ${error.message || error}`);
    }
  }

  if (connectionType === "lm-studio") {
    const startTime = Date.now();
    try {
      const formattedMessages = [
        ...(systemPrompt ? [{ role: "system", content: systemPrompt }] : []),
        ...messages
      ];

      const response = await fetch(`${cleanEndpoint}/v1/chat/completions`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: modelName,
          messages: formattedMessages,
          stream: false
        })
      });

      if (!response.ok) {
        throw new Error(`LM Studio returned status ${response.status}`);
      }

      const data = await response.json();
      const content = data.choices?.[0]?.message?.content || "";
      const durationSec = (Date.now() - startTime) / 1000;
      const tokenCount = data.usage?.completion_tokens || (content.length / 4);
      const tps = Math.round(tokenCount / durationSec);

      return { content, tps };
    } catch (error: any) {
      console.error("LM Studio API Call Failed:", error);
      throw new Error(`LM Studio error: ${error.message || error}`);
    }
  }

  throw new Error("Invalid connection type");
}

export async function createOllamaModel(
  endpoint: string,
  modelName: string,
  baseModel: string,
  systemPrompt: string
): Promise<void> {
  const cleanEndpoint = endpoint.replace(/\/$/, "");
  const modelfile = `FROM ${baseModel}\nSYSTEM """\n${systemPrompt}\n"""`;

  try {
    const response = await fetch(`${cleanEndpoint}/api/create`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        name: modelName,
        modelfile,
        stream: false
      })
    });

    if (!response.ok) {
      const errData = await response.json().catch(() => ({}));
      throw new Error(errData.error || `Ollama returned status ${response.status}`);
    }
  } catch (error: any) {
    console.error("Failed to create Ollama model:", error);
    throw new Error(`Ollama model creation failed: ${error.message || error}`);
  }
}

