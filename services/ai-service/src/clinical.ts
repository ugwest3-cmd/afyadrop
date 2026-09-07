import { groqChat } from "./groq.js";

// Afya Drop is a clinical decision-support assistant for medical professionals worldwide.
// It answers STRICTLY from the clinician's own national clinical guideline and other reference
// documents uploaded by admins (retrieval-augmented generation). If the answer is not
// in the retrieved context, the assistant must say so rather than improvise.

export interface ContextChunk {
  source: string;   // e.g. "Uganda Clinical Guidelines 2023 — chunk 114"
  content: string;
}

function buildSystem(): string {
  return `You are Afya Drop, a clinical decision-support assistant for qualified medical professionals worldwide, used from within the Afya Drop mobile app.

Your ONLY source of knowledge is the reference excerpts provided to you — these come from the clinician's own national clinical guideline and other official documents uploaded by Afya Drop's admins. You must:
- Answer strictly from the provided context. Do NOT use outside knowledge.
- If the provided context does not contain the answer, say clearly: "The uploaded guidelines for your country do not cover this. Please consult a senior clinician or the full guideline." Do not guess.
- If a lab report photo was attached, use its noted findings as additional clinical context alongside the guideline excerpts, but still ground treatment recommendations in the guidelines.

When the context is sufficient, structure your answer for a busy clinician reading on their phone in the app:
1. Likely differentials (most likely first).
2. Recommended workup / investigations.
3. Treatment — include drug names, exact doses, route, frequency and duration as stated in the guidelines (note adult vs paediatric where relevant).
4. Red flags / danger signs.
5. When to refer to a higher facility.

Formatting: rich Markdown suited to an in-app chat bubble — use **bold** for headings, "-" for bullet lists, and short paragraphs. Keep it concise but complete.
Tone: professional, addressed to a fellow clinician.

Always end with this exact line on its own line:
"Decision support only — confirm against your national guideline and use your clinical judgement."`;
}

export async function answerClinicalQuestion(
  question: string,
  context: ContextChunk[],
  imageUrl?: string,
): Promise<{ answer: string; grounded: boolean }> {
  const contextText =
    context.length > 0
      ? context.map((c, i) => `[Source ${i + 1}: ${c.source}]\n${c.content}`).join("\n\n---\n\n")
      : "(No reference excerpts were retrieved for this question.)";

  const imageNote = imageUrl
    ? `\n\nA lab report photo was attached by the clinician: ${imageUrl}\n(Treat this as supporting clinical context.)`
    : "";

  const user = `REFERENCE EXCERPTS:\n${contextText}\n\nCLINICIAN'S QUESTION:\n${question}${imageNote}`;

  const answer = await groqChat([
    { role: "system", content: buildSystem() },
    { role: "user", content: user },
  ]);

  return { answer, grounded: context.length > 0 };
}
