import { Router } from "express";
import { requireInternalSecret } from "./auth.js";
import { answerClinicalQuestion, type ContextChunk } from "./clinical.js";
import { embedText, embedMany } from "./embed.js";

export const router = Router();

router.get("/health", (_req, res) => {
  res.json({ ok: true, service: "afyadrop-ai", mode: "clinical-assistant" });
});

router.use(requireInternalSecret);

// Main entry: answer a clinician's question using retrieved UCG context.
// POST /api/ai/answer  { question, context: [{source, content}] }
router.post("/api/ai/answer", async (req, res) => {
  const { question, context } = req.body ?? {};
  if (typeof question !== "string" || !question.trim()) {
    res.status(400).json({ error: "question is required" });
    return;
  }
  const ctx: ContextChunk[] = Array.isArray(context)
    ? context
        .filter((c: unknown): c is ContextChunk =>
          !!c &&
          typeof (c as ContextChunk).source === "string" &&
          typeof (c as ContextChunk).content === "string",
        )
        .slice(0, 12)
    : [];
  try {
    const result = await answerClinicalQuestion(question, ctx);
    res.json(result);
  } catch (err) {
    res.status(502).json({ error: (err as Error).message });
  }
});

// Embedding helpers so the backend can vectorise UCG chunks at ingestion time
// and the incoming question at query time. Keeps the embedding key on this service.
router.post("/api/ai/embed", async (req, res) => {
  const { text } = req.body ?? {};
  if (typeof text !== "string" || !text.trim()) {
    res.status(400).json({ error: "text is required" });
    return;
  }
  const embedding = await embedText(text);
  res.json({ embedding });
});

router.post("/api/ai/embed-batch", async (req, res) => {
  const { texts } = req.body ?? {};
  if (!Array.isArray(texts) || !texts.every((t) => typeof t === "string")) {
    res.status(400).json({ error: "texts must be an array of strings" });
    return;
  }
  const embeddings = await embedMany(texts.slice(0, 256));
  res.json({ embeddings });
});
