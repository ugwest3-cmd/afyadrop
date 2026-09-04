export const config = {
  port: Number(process.env.PORT ?? 4001),
  groqApiKey: process.env.GROQ_API_KEY ?? "",
  groqModel: process.env.GROQ_MODEL ?? "llama-3.1-70b-versatile",
  groqBaseUrl: process.env.GROQ_BASE_URL ?? "https://api.groq.com/openai/v1",
  internalSecret: process.env.INTERNAL_API_SECRET ?? "",
  embedding: {
    // Used to embed UCG chunks and incoming questions for retrieval.
    apiKey: process.env.EMBEDDING_API_KEY ?? process.env.GROQ_API_KEY ?? "",
    baseUrl: process.env.EMBEDDING_BASE_URL ?? "https://api.groq.com/openai/v1",
    model: process.env.EMBEDDING_MODEL ?? "text-embedding-3-small",
  },
};

export function hasGroq(): boolean {
  return config.groqApiKey.length > 0;
}
