import { Router } from "express";
import { supabase } from "../db.js";
import { ai } from "../ai.js";
import { retrieveContext } from "./documents.js";
import { requireAuth } from "../authMiddleware.js";
import { config } from "../config.js";

function topUpLink(userId: string): string {
  return `${config.siteUrl}/dashboard?user=${userId}`;
}

export const qaRouter = Router();

// POST /qa/ask  { question, image_url? }  — in-app clinical Q&A, optionally
// attaching a lab report photo. Requires a valid Supabase session.
qaRouter.post("/ask", requireAuth, async (req, res) => {
  const { question: rawQuestion, image_url } = req.body ?? {};
  const question = typeof rawQuestion === "string" ? rawQuestion.trim() : "";
  if (!question) {
    res.status(400).json({ error: "question is required" });
    return;
  }

  // 1. Resolve user profile
  const { data: user } = await supabase
    .from("users")
    .select("id, suspended, country, profile_completed")
    .eq("id", req.userId)
    .maybeSingle();

  if (!user) {
    res.status(404).json({ error: "user not found" });
    return;
  }
  if (user.suspended) {
    res.status(403).json({ error: "your Afya Drop account is suspended" });
    return;
  }
  if (!user.profile_completed) {
    res.status(403).json({ error: "please complete your profile before asking a question" });
    return;
  }

  // 2. Check balance before spending on AI
  const { data: wallet } = await supabase
    .from("wallets")
    .select("balance_credits")
    .eq("user_id", user.id)
    .maybeSingle();
  const balance = wallet?.balance_credits ?? 0;
  if (balance < 1) {
    res.status(402).json({ error: "no credits left", top_up_url: topUpLink(user.id) });
    return;
  }

  // 3. Retrieve guideline context + answer via AI service (optionally
  //    grounded by an uploaded lab report image).
  let answer: string;
  let grounded = false;
  try {
    const context = await retrieveContext(question, user.country ?? "UG");
    const result = await ai.answer(question, context, typeof image_url === "string" ? image_url : undefined);
    answer = result.answer;
    grounded = result.grounded;
  } catch (err) {
    res.status(502).json({ error: (err as Error).message });
    return;
  }

  // 4. Charge 1 credit only on a successful answer
  const { data: newBalance } = await supabase.rpc("spend_credit", {
    p_user: user.id,
    p_reference: "clinical_question",
  });

  // 5. Log the Q&A
  await supabase.from("qa_logs").insert({
    user_id: user.id,
    question,
    answer,
    grounded,
  });

  res.json({
    ok: true,
    answer,
    grounded,
    balance: newBalance,
    low_balance: typeof newBalance === "number" && newBalance === 0,
  });
});
