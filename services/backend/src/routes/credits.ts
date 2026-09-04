import { Router } from "express";
import { supabase } from "../db.js";
import { config } from "../config.js";
import { createPesapalOrder, getTransactionStatus } from "../pesapal.js";
import { sendWhatsAppText } from "../baileysClient.js";

export const creditsRouter = Router();

// GET /credits/balance/:userId
creditsRouter.get("/balance/:userId", async (req, res) => {
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
creditsRouter.post("/purchase", async (req, res) => {
  const { user_id, credits } = req.body ?? {};
  const qty = Number(credits);
  if (!user_id || !Number.isInteger(qty) || qty <= 0) {
    res.status(400).json({ error: "user_id and a positive integer credits are required" });
    return;
  }
  const amountUgx = qty * config.creditPriceUgx;
  if (amountUgx < config.minPurchaseUgx) {
    res.status(400).json({ error: `minimum purchase is ${config.minPurchaseUgx} UGX` });
    return;
  }

  const { data: user } = await supabase.from("users").select("full_name, phone").eq("id", user_id).single();
  if (!user) {
    res.status(404).json({ error: "user not found" });
    return;
  }

  const { data: payment, error } = await supabase
    .from("payments")
    .insert({ user_id, credits: qty, amount_ugx: amountUgx, status: "pending" })
    .select()
    .single();
  if (error || !payment) {
    res.status(500).json({ error: error?.message ?? "failed to create payment" });
    return;
  }

  try {
    const nameParts = String(user.full_name).trim().split(/\s+/);
    const order = await createPesapalOrder({
      paymentId: payment.id,
      amountUgx,
      description: `Afya Drop: ${qty} credits`,
      phone: user.phone,
      firstName: nameParts[0],
      lastName: nameParts.slice(1).join(" "),
    });
    await supabase
      .from("payments")
      .update({ pesapal_tracking_id: order.trackingId, pesapal_merchant_ref: payment.id })
      .eq("id", payment.id);
    res.json({ payment_id: payment.id, redirect_url: order.redirectUrl });
  } catch (err) {
    await supabase.from("payments").update({ status: "failed" }).eq("id", payment.id);
    res.status(502).json({ error: (err as Error).message });
  }
});

// POST /credits/ipn   (PesaPal Instant Payment Notification)
creditsRouter.post("/ipn", async (req, res) => {
  const { OrderTrackingId, OrderMerchantReference } = req.body ?? req.query ?? {};
  if (!OrderTrackingId) {
    res.status(400).json({ error: "OrderTrackingId is required" });
    return;
  }
  try {
    const status = await getTransactionStatus(String(OrderTrackingId));
    const paid = status === "completed" || status === "paid";

    const { data: payment } = await supabase
      .from("payments")
      .select("*")
      .eq("pesapal_tracking_id", String(OrderTrackingId))
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
        p_amount_ugx: payment.amount_ugx,
        p_reference: payment.pesapal_tracking_id,
      });
      const { data: user } = await supabase.from("users").select("phone").eq("id", payment.user_id).single();
      if (user?.phone) {
        await sendWhatsAppText(user.phone, `Payment received. ${payment.credits} credits added to your Afya Drop wallet.`);
      }
    } else if (!paid) {
      await supabase.from("payments").update({ status: "failed" }).eq("id", payment.id);
    }

    res.json({ ok: true, status });
  } catch (err) {
    res.status(502).json({ error: (err as Error).message });
  }
});
