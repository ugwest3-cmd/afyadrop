import { config } from "./config.js";

// Embeds text into a vector for retrieval. Uses an OpenAI-compatible
// embeddings endpoint (configurable). Returns an empty array on failure
// so callers can degrade to keyword retrieval.

export async function embedText(text: string): Promise<number[]> {
  if (!config.embedding.apiKey) return [];
  try {
    const res = await fetch(`${config.embedding.baseUrl}/embeddings`, {
      method: "POST",
      headers: {
        "content-type": "application/json",
        authorization: `Bearer ${config.embedding.apiKey}`,
      },
      body: JSON.stringify({ model: config.embedding.model, input: text }),
    });
    if (!res.ok) return [];
    const data = (await res.json()) as { data?: Array<{ embedding?: number[] }> };
    return data.data?.[0]?.embedding ?? [];
  } catch {
    return [];
  }
}

export async function embedMany(texts: string[]): Promise<number[][]> {
  // Sequential to keep it simple and avoid rate limits; fine for MVP ingestion.
  const out: number[][] = [];
  for (const t of texts) {
    out.push(await embedText(t));
  }
  return out;
}
