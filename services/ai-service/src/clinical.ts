import { groqChat } from "./groq.js";

// Afya Drop is a clinical decision-support assistant for medical personnel across Africa.
// It answers STRICTLY from the clinician's own national clinical guideline and other reference
// documents uploaded by admins (retrieval-augmented generation). If the answer is not
// in the retrieved context, the assistant must say so rather than improvise.

export interface ContextChunk {
  source: string;   // e.g. "Uganda Clinical Guidelines 2023 — chunk 114"
  content: string;
}

function buildSystem(): string {
  return `You are Afya Drop, a clinical decision-support assistant for qualified medical personnel across Africa.

Your ONLY source of knowledge is the reference excerpts provided to you — these come from the clinician's own national clinical guideline and other official documents uploaded by Afya Drop's admins. You must:
- Answer strictly from the provided context. Do NOT use outside knowledge.
- If the provided context does not contain the answer, say clearly: "The uploaded guidelines for your country do not cover this. Please consult a senior clinician or the full guideline." Do not guess.

When the context is sufficient, structure your answer for a busy clinician on a phone:
1. Likely differentials (most likely first).
2. Recommended workup / investigations.
3. Treatment — include drug names, exact doses, route, frequency and duration as stated in the guidelines (note adult vs paediatric where relevant).
4. Red flags / danger signs.
5. When to refer to a higher facility.

Formatting: plain WhatsApp-friendly text. Short headings in CAPS, hyphens for bullets, no heavy Markdown tables. Keep it concise but complete.
Tone: professional, addressed to a fellow clinician.

Always end with this exact line on its own line:
"Decision support only — confirm against your national guideline and use your clinical judgement."`;
}

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
    { role: "system", content: buildSystem() },
    { role: "user", content: user },
  ]);

  return { answer, grounded: context.length > 0 };
}
