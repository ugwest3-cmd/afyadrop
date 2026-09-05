"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";
import { api, type Country } from "@/lib/api";
import { Input, Select } from "@/components/Input";
import { Button } from "@/components/Button";
import { Card } from "@/components/Card";
import { GoogleIcon } from "@/components/icons";

const QUALIFICATIONS = [
  "Pharmacist",
  "Pharmacy Technician",
  "Nurse",
  "Clinical Officer",
  "Doctor",
  "Midwife",
  "Laboratory Technician",
  "Other",
];

type Step = "account" | "otp" | "profile" | "done";

export default function Register() {
  const router = useRouter();
  const [countries, setCountries] = useState<Country[]>([]);
  const [step, setStep] = useState<Step>("account");
  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const [profile, setProfile] = useState({
    full_name: "",
    country: "UG",
    qualification: QUALIFICATIONS[0],
    licence_number: "",
  });
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    api.countries().then((r) => setCountries(r.countries)).catch(() => setCountries([]));
  }, []);

  // If the user already has a session (e.g. just returned from Google OAuth),
  // skip straight to the profile step or the dashboard.
  useEffect(() => {
    supabase.auth.getSession().then(async ({ data }) => {
      if (!data.session) return;
      try {
        const { user } = await api.me();
        if (user?.profile_completed) {
          router.push("/dashboard");
        } else {
          setStep("profile");
        }
      } catch {
        setStep("profile");
      }
    });
  }, [router]);

  function updateProfile(k: keyof typeof profile) {
    return (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>
      setProfile((f) => ({ ...f, [k]: e.target.value }));
  }

  async function onSendOtp(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const { error: otpError } = await supabase.auth.signInWithOtp({ email });
      if (otpError) throw otpError;
      setMessage(`We've emailed a 6-digit code to ${email}.`);
      setStep("otp");
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  }

  async function onVerifyOtp(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const { error: verifyError } = await supabase.auth.verifyOtp({ email, token: code, type: "email" });
      if (verifyError) throw verifyError;
      setStep("profile");
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  }

  async function onGoogle() {
    setError("");
    await supabase.auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo: `${window.location.origin}/auth/callback?next=/register` },
    });
  }

  async function onSubmitProfile(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await api.completeProfile(profile);
      setStep("done");
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="bg-cream py-14 sm:py-20">
      <div className="container-site grid items-start gap-10 lg:grid-cols-2">
        {/* Value prop */}
        <div className="order-2 lg:order-1">
          <span className="text-sm font-semibold uppercase tracking-[0.2em] text-teal-700">Register</span>
          <h1 className="mt-3 text-3xl font-bold text-teal sm:text-4xl">Create your account</h1>
          <p className="mt-4 max-w-md text-muted">
            Join medical professionals across Africa getting instant, guideline-grounded clinical answers in the
            Afya Drop app.
          </p>
          <ul className="mt-8 space-y-4">
            {[
              "Answers grounded in your country's national clinical guidelines",
              "5 free credits when you register — then pay per question",
              "Sign in with email or Google — no phone number needed",
            ].map((t) => (
              <li key={t} className="flex gap-3 text-sm text-teal/90">
                <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-sage text-xs font-bold text-teal">✓</span>
                {t}
              </li>
            ))}
          </ul>
          <p className="mt-10 text-sm text-muted">
            Already registered? <Link href="/login" className="font-semibold text-teal underline">Login</Link>
          </p>
        </div>

        {/* Form */}
        <Card className="order-1 lg:order-2">
          {/* Step indicator */}
          <div className="mb-6 flex items-center gap-2 text-xs font-semibold uppercase tracking-wide">
            <span className={step === "account" ? "text-teal" : "text-muted"}>1 · Account</span>
            <span className="h-px w-6 bg-teal/20" />
            <span className={step === "profile" ? "text-teal" : "text-muted"}>2 · Profile</span>
            <span className="h-px w-6 bg-teal/20" />
            <span className={step === "done" ? "text-teal" : "text-muted"}>3 · Done</span>
          </div>

          {step === "account" && (
            <div className="space-y-5">
              <Button type="button" variant="secondary" onClick={onGoogle} className="w-full justify-center gap-2">
                <GoogleIcon /> Continue with Google
              </Button>
              <div className="flex items-center gap-3 text-xs font-semibold uppercase text-muted">
                <span className="h-px flex-1 bg-teal/10" /> or <span className="h-px flex-1 bg-teal/10" />
              </div>
              <form onSubmit={onSendOtp} className="space-y-5">
                <Input
                  id="email"
                  type="email"
                  label="Email address"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  hint="We'll email you a 6-digit verification code."
                  required
                />
                <Button type="submit" loading={loading} className="w-full">
                  Continue with email
                </Button>
                {error && <p className="error-text">{error}</p>}
              </form>
            </div>
          )}

          {step === "otp" && (
            <form onSubmit={onVerifyOtp} className="space-y-5">
              <p className="text-sm text-muted">{message}</p>
              <Input
                id="code"
                label="6-digit verification code"
                value={code}
                onChange={(e) => setCode(e.target.value)}
                maxLength={6}
                inputMode="numeric"
                required
              />
              <Button type="submit" loading={loading} className="w-full">
                Verify email
              </Button>
              {error && <p className="error-text">{error}</p>}
            </form>
          )}

          {step === "profile" && (
            <form onSubmit={onSubmitProfile} className="space-y-5">
              <p className="text-sm text-muted">Tell us about your practice to finish setting up your account.</p>
              <Input id="full_name" label="Full name" value={profile.full_name} onChange={updateProfile("full_name")} required />
              <Select id="country" label="Country" value={profile.country} onChange={updateProfile("country")} hint="We answer from your country's national clinical guideline.">
                {countries.length === 0 && <option value="UG">Uganda</option>}
                {countries.map((c) => (
                  <option key={c.code} value={c.code}>{c.name}</option>
                ))}
              </Select>
              <Select id="qualification" label="Medical qualification" value={profile.qualification} onChange={updateProfile("qualification")}>
                {QUALIFICATIONS.map((q) => (
                  <option key={q} value={q}>{q}</option>
                ))}
              </Select>
              <Input
                id="licence_number"
                label="Practising licence number"
                value={profile.licence_number}
                onChange={updateProfile("licence_number")}
                required
              />
              <Button type="submit" loading={loading} className="w-full">
                Finish registration
              </Button>
              {error && <p className="error-text">{error}</p>}
            </form>
          )}

          {step === "done" && (
            <div className="py-6 text-center">
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-sage text-2xl text-teal">✓</div>
              <h2 className="mt-4 text-xl font-bold text-teal">You're all set</h2>
              <p className="mt-2 text-sm text-muted">
                Your account is confirmed and we've added <strong>5 free credits</strong> to your wallet.
                Start asking clinical questions in the Afya Drop app right away.
              </p>
              <Link href="/dashboard" className="btn-primary mt-6 inline-flex">View wallet →</Link>
            </div>
          )}
        </Card>
      </div>
    </main>
  );
}
