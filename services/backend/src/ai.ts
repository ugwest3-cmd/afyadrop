import { config } from "./config.js";

async function call<T>(path: string, body: unknown): Promise<T> {
  const res = await fetch(`${config.aiServiceUrl}${path}`, {
    method: "POST",
    headers: {
      "content-type": "application/json",
      "x-internal-secret": config.internalSecret,
    },
    body: JSON.stringify(body),
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`AI service ${res.status}: ${text}`);
  }
  return (await res.json()) as T;
}

export interface ContextChunk {
  source: string;
  content: string;
}

export const ai = {
  answer: (question: string, context: ContextChunk[], imageUrl?: string) =>
    call<{ answer: string; grounded: boolean }>("/api/ai/answer", { question, context, image_url: imageUrl }),
  embed: (text: string) => call<{ embedding: number[] }>("/api/ai/embed", { text }),
  embedBatch: (texts: string[]) =>
    call<{ embeddings: number[][] }>("/api/ai/embed-batch", { texts }),
};
