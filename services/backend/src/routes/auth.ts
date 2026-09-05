import { Router } from "express";
import { supabase } from "../db.js";
import { requireAuth } from "../authMiddleware.js";
import { getCountry, COUNTRIES } from "../countries.js";

export const authRouter = Router();

const FREE_SIGNUP_CREDITS = 5;

// GET /auth/me — current user's profile (requires Supabase session)
authRouter.get("/me", requireAuth, async (req, res) => {
  const { data: user, error } = await supabase
    .from("users")
    .select("*")
    .eq("id", req.userId)
    .maybeSingle();
  if (error) {
    res.status(500).json({ error: error.message });
    return;
  }
  res.json({ user });
});

// PATCH /auth/profile  { full_name, country, qualification, licence_number }
// Completes the clinician profile after Supabase Auth sign-up (email OTP or
// Google). Grants 5 free credits the first time a profile is completed.
authRouter.patch("/profile", requireAuth, async (req, res) => {
  const { full_name, country, qualification, licence_number } = req.body ?? {};
  const countryCode = String(country ?? "").toUpperCase();
  const countryRow = getCountry(countryCode);

  if (!full_name || !countryRow || !qualification || !licence_number) {
    res.status(400).json({
      error: "full_name, a supported country, qualification and licence_number are required",
    });
    return;
  }

  const { data: user, error } = await supabase
    .from("users")
    .update({
      full_name,
      country: countryCode,
      qualification,
      licence_number,
      profile_completed: true,
    })
    .eq("id", req.userId)
    .select()
    .single();
  if (error || !user) {
    res.status(500).json({ error: error?.message ?? "failed to update profile" });
    return;
  }

  await supabase.from("wallets").upsert({ user_id: user.id }, { onConflict: "user_id" });

  // Grant 5 free credits once (only if this user has never had a bonus grant).
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
    const { data: wallet } = await supabase
      .from("wallets")
      .select("balance_credits")
      .eq("user_id", user.id)
      .maybeSingle();
    const newBalance = (wallet?.balance_credits ?? 0) + FREE_SIGNUP_CREDITS;
    await supabase
      .from("wallets")
      .upsert({ user_id: user.id, balance_credits: newBalance }, { onConflict: "user_id" });
  }

  res.json({ ok: true, user });
});

// GET /auth/countries — list supported countries for the registration form
authRouter.get("/countries", (_req, res) => {
  res.json({ countries: COUNTRIES });
});
