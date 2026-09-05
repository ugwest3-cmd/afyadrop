"use client";

import { useState } from "react";
import Link from "next/link";
import { api } from "@/lib/api";
import { Input, Select } from "@/components/Input";
import { Button } from "@/components/Button";
import { Card } from "@/components/Card";

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

export default function Register() {
  const [form, setForm] = useState({
    full_name: "",
    phone: "",
    qualification: QUALIFICATIONS[0],
    licence_number: "",
  });
  const [step, setStep] = useState<"form" | "otp" | "done">("form");
  const [code, setCode] = useState("");
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  function update(k: keyof typeof form) {
    return (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>
      setForm((f) => ({ ...f, [k]: e.target.value }));
  }

  async function onRegister(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const res = await api.register(form);
      setMessage(res.message ?? "Verification code sent to your WhatsApp.");
      setStep("otp");
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  }

  async function onVerify(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await api.verify(form.phone, code);
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
            Join Ugandan clinicians getting instant, guideline-grounded clinical answers on WhatsApp.
          </p>
          <ul className="mt-8 space-y-4">
            {[
              "Answers grounded in the Uganda Clinical Guidelines",
              "Pay per question — 1 credit = 100 UGX",
              "Delivered over WhatsApp — no app to install",
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
            <span className={step === "form" ? "text-teal" : "text-muted"}>1 · Details</span>
            <span className="h-px w-6 bg-teal/20" />
            <span className={step === "otp" ? "text-teal" : "text-muted"}>2 · Verify</span>
            <span className="h-px w-6 bg-teal/20" />
            <span className={step === "done" ? "text-teal" : "text-muted"}>3 · Done</span>
          </div>

          {step === "form" && (
            <form onSubmit={onRegister} className="space-y-5">
              <Input id="full_name" label="Full name" value={form.full_name} onChange={update("full_name")} required />
              <Input
                id="phone"
                label="Mobile number (WhatsApp)"
                placeholder="07XXXXXXXX"
                value={form.phone}
                onChange={update("phone")}
                hint="Ugandan number — we will WhatsApp you a verification code."
                required
              />
              <Select id="qualification" label="Medical qualification" value={form.qualification} onChange={update("qualification")}>
                {QUALIFICATIONS.map((q) => (
                  <option key={q} value={q}>{q}</option>
                ))}
              </Select>
              <Input
                id="licence_number"
                label="Practising licence number"
                value={form.licence_number}
                onChange={update("licence_number")}
                required
              />
              <Button type="submit" loading={loading} className="w-full">
                Register
              </Button>
              {error && <p className="error-text">{error}</p>}
            </form>
          )}

          {step === "otp" && (
            <form onSubmit={onVerify} className="space-y-5">
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
                Verify number
              </Button>
              {error && <p className="error-text">{error}</p>}
            </form>
          )}

          {step === "done" && (
            <div className="py-6 text-center">
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-sage text-2xl text-teal">✓</div>
              <h2 className="mt-4 text-xl font-bold text-teal">You're verified</h2>
              <p className="mt-2 text-sm text-muted">
                Your number is confirmed. Buy credits to start asking clinical questions on WhatsApp.
              </p>
              <Link href="/dashboard" className="btn-primary mt-6 inline-flex">Buy credits →</Link>
            </div>
          )}
        </Card>
      </div>
    </main>
  );
}
