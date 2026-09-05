import { Router } from "express";
import { supabase } from "../db.js";
import { ai, type ContextChunk } from "../ai.js";

export const documentsRouter = Router();

// ---- Text chunking (naive, by characters with overlap) ----
function chunkText(text: string, size = 1200, overlap = 150): string[] {
  const chunks: string[] = [];
  let i = 0;
  while (i < text.length) {
    chunks.push(text.slice(i, i + size));
    i += size - overlap;
  }
  return chunks.map((c) => c.trim()).filter(Boolean);
}

// POST /documents/ingest  { title, country, source_type, text, uploaded_by }
// The frontend extracts text from the uploaded file (client-side) and posts it here.
// We chunk, embed (via the AI service), and store rows in document_chunks.
documentsRouter.post("/ingest", async (req, res) => {
  const { title, country = "UG", source_type = "ucg", text, uploaded_by } = req.body ?? {};
  const countryCode = String(country).toUpperCase();
  if (!title || typeof text !== "string" || !text.trim()) {
    res.status(400).json({ error: "title and text are required" });
    return;
  }

  const { data: doc, error } = await supabase
    .from("documents")
    .insert({ title, country: countryCode, source_type, uploaded_by: uploaded_by ?? null, status: "processing" })
    .select()
    .single();
  if (error || !doc) {
    res.status(500).json({ error: error?.message ?? "failed to create document" });
    return;
  }

  try {
    const chunks = chunkText(text);
    const { embeddings } = await ai.embedBatch(chunks);

    const rows = chunks.map((content, idx) => ({
      document_id: doc.id,
      chunk_index: idx,
      source_label: `${title} — chunk ${idx + 1}`,
      content,
      embedding: embeddings[idx]?.length ? JSON.stringify(embeddings[idx]) : null,
    }));

    const { error: insErr } = await supabase.from("document_chunks").insert(rows);
    if (insErr) throw new Error(insErr.message);

    await supabase.from("documents").update({ status: "ready" }).eq("id", doc.id);
    res.json({ ok: true, document_id: doc.id, chunks: rows.length });
  } catch (err) {
    await supabase.from("documents").update({ status: "failed" }).eq("id", doc.id);
    res.status(502).json({ error: (err as Error).message });
  }
});

// GET /documents — list uploaded reference docs (for the admin panel)
documentsRouter.get("/", async (_req, res) => {
  const { data, error } = await supabase
    .from("documents")
    .select("id, title, country, source_type, status, created_at")
    .order("created_at", { ascending: false });
  if (error) {
    res.status(500).json({ error: error.message });
    return;
  }
  res.json({ documents: data });
});

// DELETE /documents/:id
documentsRouter.delete("/:id", async (req, res) => {
  const { error } = await supabase.from("documents").delete().eq("id", req.params.id);
  if (error) {
    res.status(500).json({ error: error.message });
    return;
  }
  res.json({ ok: true });
});

// ---- Retrieval: find the most relevant guideline chunks for a question,
// restricted to the clinician's own country. ----
export async function retrieveContext(question: string, country: string, matchCount = 6): Promise<ContextChunk[]> {
  // 1. Embed the question
  const { embedding } = await ai.embed(question);
  if (!embedding.length) return [];

  // 2. Vector similarity search via the SQL function, filtered to the country
  const { data, error } = await supabase.rpc("match_document_chunks", {
    query_embedding: JSON.stringify(embedding),
    match_count: matchCount,
    match_threshold: 0.2,
    match_country: country,
  });
  if (error || !data) return [];

  return (data as Array<{ source_label: string | null; content: string }>).map((r) => ({
    source: r.source_label ?? "reference",
    content: r.content,
  }));
}
