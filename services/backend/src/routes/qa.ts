import { Router } from "express";
import { supabase } from "../db.js";
import { ai } from "../ai.js";
import { sendWhatsAppText } from "../baileysClient.js";
import { retrieveContext } from "./documents.js";
import { config } from "../config.js";

function topUpLink(userId: string): string {
  return `${config.siteUrl}/dashboard?user=${userId}`;
}

export const qaRouter = Router();

// POST /qa/from-whatsapp  { phone, text }  — called by the Baileys service
qaRouter.post("/from-whatsapp", async (req, res) => {
  const { phone, text } = req.body ?? {};
  if (!phone || typeof text !== "string" || !text.trim()) {
    res.status(400).json({ error: "phone and text are required" });
    return;
  }
  const question = text.trim();

  // 1. Resolve user
  const { data: user } = await supabase
    .from("users")
    .select("id, phone_verified, full_name, suspended, country")
    .eq("phone", String(phone))
    .maybeSingle();

  if (!user) {
    await sendWhatsAppText(String(phone), `Please register at ${config.siteUrl}/register to use Afya Drop.`);
    res.json({ ok: true, action: "unregistered" });
    return;
  }
  if (user.suspended) {
    await sendWhatsAppText(String(phone), "Your Afya Drop account is suspended. Please contact support.");
    res.json({ ok: true, action: "suspended" });
    return;
  }
  if (!user.phone_verified) {
    await sendWhatsAppText(String(phone), `Please verify your number at ${config.siteUrl} to continue.`);
    res.json({ ok: true, action: "unverified" });
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
    await sendWhatsAppText(
      String(phone),
      `You have no credits left. Top up here to keep asking questions: ${topUpLink(user.id)}`,
    );
    res.json({ ok: true, action: "no_credits" });
    return;
  }

  // 3. Retrieve UCG context + answer via AI service
  let answer: string;
  let grounded = false;
  try {
    const context = await retrieveContext(question, user.country ?? "UG");
    const result = await ai.answer(question, context);
    answer = result.answer;
    grounded = result.grounded;
  } catch (err) {
    await sendWhatsAppText(String(phone), "Sorry, Afya Drop could not answer right now. Please try again.");
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

  // 6. Reply over WhatsApp (with a top-up link if they just ran out)
  let reply = answer;
  if (typeof newBalance === "number" && newBalance === 0) {
    reply += `\n\nThat was your last credit. Top up here: ${topUpLink(user.id)}`;
  }
  await sendWhatsAppText(String(phone), reply);
  res.json({ ok: true, action: "answered", grounded, balance: newBalance });
});
