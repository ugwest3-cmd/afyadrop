import { Router } from "express";
import { supabase } from "../db.js";
import { sendWhatsAppText } from "../baileysClient.js";

export const authRouter = Router();

function normalizeUgPhone(input: string): string | null {
  const digits = input.replace(/\D/g, "");
  if (/^0?7\d{8}$/.test(digits)) return `+256${digits.slice(-9)}`;
  if (/^2567\d{8}$/.test(digits)) return `+${digits}`;
  return null;
}

function makeOtp(): string {
  return String(Math.floor(100000 + Math.random() * 900000));
}

// POST /auth/register  { full_name, phone, qualification, licence_number }
authRouter.post("/register", async (req, res) => {
  const { full_name, phone, qualification, licence_number } = req.body ?? {};
  const normalized = normalizeUgPhone(String(phone ?? ""));
  if (!full_name || !normalized || !qualification || !licence_number) {
    res.status(400).json({ error: "full_name, a valid Ugandan phone, qualification and licence_number are required" });
    return;
  }

  const { data: user, error } = await supabase
    .from("users")
    .upsert(
      { full_name, phone: normalized, qualification, licence_number, phone_verified: false },
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

// POST /auth/verify  { phone, code }
authRouter.post("/verify", async (req, res) => {
  const { phone, code } = req.body ?? {};
  const normalized = normalizeUgPhone(String(phone ?? ""));
  if (!normalized || !code) {
    res.status(400).json({ error: "phone and code are required" });
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

  res.json({ ok: true, user });
});
