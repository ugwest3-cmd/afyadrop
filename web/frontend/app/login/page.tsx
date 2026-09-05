"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";
import { Input } from "@/components/Input";
import { Button } from "@/components/Button";
import { Card } from "@/components/Card";
import { GoogleIcon } from "@/components/icons";

type Step = "email" | "otp";

export default function Login() {
  const router = useRouter();
  const [step, setStep] = useState<Step>("email");
  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      if (data.session) router.push("/dashboard");
    });
  }, [router]);

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
      router.push("/dashboard");
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
      options: { redirectTo: `${window.location.origin}/auth/callback?next=/dashboard` },
    });
  }

  return (
    <main className="flex min-h-[70vh] items-center bg-cream py-16">
      <div className="container-site max-w-md">
        <Card>
          <h1 className="text-2xl font-bold text-teal">Welcome back</h1>
          <p className="mt-2 text-sm text-muted">Sign in with your email or Google account.</p>

          <div className="mt-6 space-y-5">
            <Button type="button" variant="secondary" onClick={onGoogle} className="w-full justify-center gap-2">
              <GoogleIcon /> Continue with Google
            </Button>
            <div className="flex items-center gap-3 text-xs font-semibold uppercase text-muted">
              <span className="h-px flex-1 bg-teal/10" /> or <span className="h-px flex-1 bg-teal/10" />
            </div>

            {step === "email" && (
              <form onSubmit={onSendOtp} className="space-y-5">
                <Input
                  id="email"
                  type="email"
                  label="Email address"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  hint="We'll email you a 6-digit sign-in code."
                  required
                />
                <Button type="submit" loading={loading} className="w-full">Send code</Button>
                {error && <p className="error-text">{error}</p>}
              </form>
            )}

            {step === "otp" && (
              <form onSubmit={onVerifyOtp} className="space-y-5">
                <p className="text-sm text-muted">{message}</p>
                <Input
                  id="code"
                  label="6-digit code"
                  value={code}
                  onChange={(e) => setCode(e.target.value)}
                  maxLength={6}
                  inputMode="numeric"
                  required
                />
                <Button type="submit" loading={loading} className="w-full">Continue</Button>
                {error && <p className="error-text">{error}</p>}
              </form>
            )}
          </div>

          <p className="mt-6 text-center text-sm text-muted">
            Don't have an account?{" "}
            <Link href="/register" className="font-semibold text-teal underline">Register</Link>
          </p>
        </Card>
      </div>
    </main>
  );
}
