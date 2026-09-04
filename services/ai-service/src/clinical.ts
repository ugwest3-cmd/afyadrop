import { groqChat } from "./groq.js";

// Afya Drop is a clinical decision-support assistant for medical personnel in Uganda.
// It answers STRICTLY from the Uganda Clinical Guidelines (UCG) and other reference
// documents uploaded by admins (retrieval-augmented generation). If the answer is not
// in the retrieved context, the assistant must say so rather than improvise.

export interface ContextChunk {
  source: string;   // e.g. "Uganda Clinical Guidelines 2023 — p.114"
  content: string;
}

const SYSTEM = `You are Afya Drop, a clinical decision-support assistant for qualified medical personnel in Uganda.

Your ONLY source of knowledge is the reference excerpts provided to you (from the Uganda Clinical Guidelines and other uploaded documents). You must:
- Answer strictly from the provided context. Do NOT use outside knowledge.
- If the provided context does not contain the answer, say clearly: "The uploaded guidelines do not cover this. Please consult a senior clinician or the full UCG." Do not guess.

When the context is sufficient, structure your answer for a busy clinician on a phone:
1. Likely differentials (most likely first).
2. Recommended workup / investigations.
3. Treatment — include drug names, exact doses, route, frequency and duration as stated in the guidelines (note adult vs paediatric where relevant).
4. Red flags / danger signs.
5. When to refer to a higher facility.

Formatting: plain WhatsApp-friendly text. Short headings in CAPS, hyphens for bullets, no heavy Markdown tables. Keep it concise but complete.
Tone: professional, addressed to a fellow clinician.

Always end with this exact line on its own line:
"Decision support only — confirm against the full UCG and use your clinical judgement."`;

export async function answerClinicalQuestion(
  question: string,
  context: ContextChunk[],
): Promise<{ answer: string; grounded: boolean }> {
  const contextText =
    context.length > 0
      ? context.map((c, i) => `[Source ${i + 1}: ${c.source}]\n${c.content}`).join("\n\n---\n\n")
      : "(No reference excerpts were retrieved for this question.)";

  const user = `REFERENCE EXCERPTS:\n${contextText}\n\nCLINICIAN'S QUESTION:\n${question}`;

  const answer = await groqChat([
    { role: "system", content: SYSTEM },
    { role: "user", content: user },
  ]);

  return { answer, grounded: context.length > 0 };
}
