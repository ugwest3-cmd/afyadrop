import { Router } from "express";
import { supabase } from "../db.js";
import { config } from "../config.js";
import { createCheckout } from "../intasend.js";
import { requireAuth } from "../authMiddleware.js";

export const creditsRouter = Router();

// GET /credits/balance/:userId
creditsRouter.get("/balance/:userId", requireAuth, async (req, res) => {
  const { userId } = req.params;
  const { data, error } = await supabase
    .from("wallets")
    .select("balance_credits")
    .eq("user_id", userId)
    .maybeSingle();
  if (error) {
    res.status(500).json({ error: error.message });
    return;
  }
  res.json({ balance_credits: data?.balance_credits ?? 0 });
});

// POST /credits/purchase  { user_id, credits }
creditsRouter.post("/purchase", requireAuth, async (req, res) => {
  const { user_id, credits } = req.body ?? {};
  const qty = Number(credits);
  if (!user_id || !Number.isInteger(qty) || qty <= 0) {
    res.status(400).json({ error: "user_id and a positive integer credits are required" });
    return;
  }
  const amount = qty * config.creditPriceUsd;
  if (amount < config.minPurchaseUsd) {
    res.status(400).json({ error: `minimum purchase is $${config.minPurchaseUsd}` });
    return;
  }

  const { data: user } = await supabase.from("users").select("email").eq("id", user_id).single();
  if (!user) {
    res.status(404).json({ error: "user not found" });
    return;
  }

  const { data: payment, error } = await supabase
    .from("payments")
    .insert({ user_id, credits: qty, amount, currency: "USD", status: "pending" })
    .select()
    .single();
  if (error || !payment) {
    res.status(500).json({ error: error?.message ?? "failed to create payment" });
    return;
  }

  try {
    const order = await createCheckout({
      amount,
      currency: "USD",
      email: user.email || "",
      apiRef: payment.id,
    });
    await supabase
      .from("payments")
      .update({ provider_tracking_id: order.invoiceId, provider_ref: payment.id })
      .eq("id", payment.id);
    res.json({ payment_id: payment.id, redirect_url: order.url });
  } catch (err) {
    await supabase.from("payments").update({ status: "failed" }).eq("id", payment.id);
    res.status(502).json({ error: (err as Error).message });
  }
});

// POST /credits/webhook   (IntaSend Webhook)
creditsRouter.post("/webhook", async (req, res) => {
  // IntaSend sends data in req.body
  const { invoice_id, state, value, account } = req.body ?? {};
  
  if (!invoice_id) {
    res.status(400).json({ error: "invoice_id is required" });
    return;
  }

  try {
    const paid = state === "COMPLETE" || state === "PROCESSING";

    const { data: payment } = await supabase
      .from("payments")
      .select("*")
      .eq("provider_tracking_id", String(invoice_id))
      .maybeSingle();

    if (!payment) {
      res.status(404).json({ error: "payment not found" });
      return;
    }

    if (paid && payment.status !== "paid") {
      await supabase
        .from("payments")
        .update({ status: "paid", paid_at: new Date().toISOString() })
        .eq("id", payment.id);
      await supabase.rpc("add_credits", {
        p_user: payment.user_id,
        p_credits: payment.credits,
        p_amount: payment.amount,
        p_currency: payment.currency || "USD",
        p_reference: payment.provider_tracking_id,
      });
    } else if (state === "FAILED") {
      await supabase.from("payments").update({ status: "failed" }).eq("id", payment.id);
    }

    res.json({ ok: true, status: state });
  } catch (err) {
    res.status(502).json({ error: (err as Error).message });
  }
});
