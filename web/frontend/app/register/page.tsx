"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { api, type Country } from "@/lib/api";
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
  const [countries, setCountries] = useState<Country[]>([]);
  const [form, setForm] = useState({
    full_name: "",
    phone: "",
    country: "UG",
    qualification: QUALIFICATIONS[0],
    licence_number: "",
  });
  const [step, setStep] = useState<"form" | "otp" | "done">("form");
  const [code, setCode] = useState("");
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    api.countries().then((r) => setCountries(r.countries)).catch(() => setCountries([]));
  }, []);

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
      await api.verify(form.phone, form.country, code);
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
            Join medical professionals across Africa getting instant, guideline-grounded clinical answers on WhatsApp.
          </p>
          <ul className="mt-8 space-y-4">
            {[
              "Answers grounded in your country's national clinical guidelines",
              "5 free credits when you register — then pay per question",
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
              <Select id="country" label="Country" value={form.country} onChange={update("country")} hint="We answer from your country's national clinical guideline.">
                {countries.length === 0 && <option value="UG">Uganda</option>}
                {countries.map((c) => (
                  <option key={c.code} value={c.code}>{c.name}</option>
                ))}
              </Select>
              <Input
                id="phone"
                label="Mobile number (WhatsApp)"
                placeholder="07XXXXXXXX"
                value={form.phone}
                onChange={update("phone")}
                hint="We will WhatsApp you a verification code."
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
                Your number is confirmed and we've added <strong>5 free credits</strong> to your wallet.
                Start asking clinical questions on WhatsApp right away.
              </p>
              <Link href="/dashboard" className="btn-primary mt-6 inline-flex">View wallet →</Link>
            </div>
          )}
        </Card>
      </div>
    </main>
  );
}
