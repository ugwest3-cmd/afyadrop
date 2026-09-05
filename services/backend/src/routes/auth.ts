import { Router } from "express";
import { supabase } from "../db.js";
import { sendWhatsAppText } from "../baileysClient.js";
import { normalizePhone, getCountry, COUNTRIES } from "../countries.js";

export const authRouter = Router();

const FREE_SIGNUP_CREDITS = 5;

function makeOtp(): string {
  return String(Math.floor(100000 + Math.random() * 900000));
}

// POST /auth/register  { full_name, phone, country, qualification, licence_number }
authRouter.post("/register", async (req, res) => {
  const { full_name, phone, country, qualification, licence_number } = req.body ?? {};
  const countryCode = String(country ?? "").toUpperCase();
  const countryRow = getCountry(countryCode);
  const normalized = normalizePhone(String(phone ?? ""), countryCode);

  if (!full_name || !normalized || !countryRow || !qualification || !licence_number) {
    res.status(400).json({
      error: "full_name, country, a valid phone, qualification and licence_number are required",
    });
    return;
  }

  const { data: user, error } = await supabase
    .from("users")
    .upsert(
      {
        full_name,
        phone: normalized,
        country: countryCode,
        qualification,
        licence_number,
        phone_verified: false,
      },
      { onConflict: "phone" },
    )
    .select()
    .single();
  if (error || !user) {
    res.status(500).json({ error: error?.message ?? "failed to create user" });
    return;
  }

  await supabase.from("wallets").upsert({ user_id: user.id }, { onConflict: "user_id" });

  const code = makeOtp();
  const expiresAt = new Date(Date.now() + 10 * 60_000).toISOString();
  await supabase.from("otp_codes").insert({ phone: normalized, code, expires_at: expiresAt });
  await sendWhatsAppText(normalized, `Your Afya Drop verification code is ${code}. It expires in 10 minutes.`);

  res.json({ ok: true, user_id: user.id, message: "OTP sent over WhatsApp" });
});

// POST /auth/verify  { phone, country, code }
// On successful verification, grant 5 free credits (once).
authRouter.post("/verify", async (req, res) => {
  const { phone, country, code } = req.body ?? {};
  const normalized = normalizePhone(String(phone ?? ""), String(country ?? ""));
  if (!normalized || !code) {
    res.status(400).json({ error: "phone, country and code are required" });
    return;
  }

  const { data: otp } = await supabase
    .from("otp_codes")
    .select("*")
    .eq("phone", normalized)
    .eq("code", String(code))
    .eq("consumed", false)
    .gt("expires_at", new Date().toISOString())
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (!otp) {
    res.status(400).json({ error: "invalid or expired code" });
    return;
  }

  await supabase.from("otp_codes").update({ consumed: true }).eq("id", otp.id);
  const { data: user } = await supabase
    .from("users")
    .update({ phone_verified: true })
    .eq("phone", normalized)
    .select()
    .single();

  // Grant 5 free credits once (only if this user has never had a bonus grant).
  if (user) {
    const { data: existing } = await supabase
      .from("credit_transactions")
      .select("id")
      .eq("user_id", user.id)
      .eq("type", "bonus")
      .eq("reference", "signup_bonus")
      .limit(1)
      .maybeSingle();

    if (!existing) {
      await supabase.from("credit_transactions").insert({
        user_id: user.id,
        type: "bonus",
        credits: FREE_SIGNUP_CREDITS,
        reference: "signup_bonus",
      });
      // Upsert wallet balance
      const { data: wallet } = await supabase
        .from("wallets")
        .select("balance_credits")
        .eq("user_id", user.id)
        .maybeSingle();
      const newBalance = (wallet?.balance_credits ?? 0) + FREE_SIGNUP_CREDITS;
      await supabase
        .from("wallets")
        .upsert({ user_id: user.id, balance_credits: newBalance }, { onConflict: "user_id" });

      await sendWhatsAppText(
        normalized,
        `Welcome to Afya Drop! You've received ${FREE_SIGNUP_CREDITS} free credits to get started. Ask any clinical question right here on WhatsApp.`,
      );
    }
  }

  res.json({ ok: true, user });
});

// GET /auth/countries — list supported countries for the registration form
authRouter.get("/countries", (_req, res) => {
  res.json({ countries: COUNTRIES });
});
