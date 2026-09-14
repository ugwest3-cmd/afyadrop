import { config } from "./config.js";

// Embeds text into a vector for retrieval. Uses Jina AI's embeddings API
// (OpenAI-compatible). Returns an empty array on failure so callers can
// degrade to keyword retrieval.

// Rate-limit error logging to avoid flooding Railway logs (max 1 log per 60s).
let lastEmbedErrorLog = 0;
const EMBED_LOG_INTERVAL_MS = 60_000;

function logEmbedError(msg: string, ...args: unknown[]) {
  const now = Date.now();
  if (now - lastEmbedErrorLog >= EMBED_LOG_INTERVAL_MS) {
    lastEmbedErrorLog = now;
    console.error(msg, ...args);
  }
}

async function callEmbedAPI(
  input: string | string[],
): Promise<Array<{ embedding?: number[] }>> {
  if (!config.embedding.apiKey) return [];
  const url = `${config.embedding.baseUrl}/embeddings`;
  try {
    const res = await fetch(url, {
      method: "POST",
      headers: {
        "content-type": "application/json",
        authorization: `Bearer ${config.embedding.apiKey}`,
      },
      body: JSON.stringify({
        model: config.embedding.model,
        task: config.embedding.task,
        truncate: true,
        input: Array.isArray(input) ? input : [input],
      }),
    });
    if (!res.ok) {
      logEmbedError(
        `Embedding API error: ${res.status} (URL: ${url})`,
        await res.text(),
      );
      return [];
    }
    const data = (await res.json()) as {
      data?: Array<{ embedding?: number[] }>;
    };
    return data.data ?? [];
  } catch (e) {
    logEmbedError(`Embedding request failed (URL: ${url}):`, e);
    return [];
  }
}

export async function embedText(text: string): Promise<number[]> {
  const results = await callEmbedAPI(text);
  return results[0]?.embedding ?? [];
}

export async function embedMany(texts: string[]): Promise<number[][]> {
  if (!texts.length) return [];
  // Jina supports batch input natively — send all at once (capped at 256 by caller).
  const results = await callEmbedAPI(texts);
  return texts.map((_, i) => results[i]?.embedding ?? []);
}
