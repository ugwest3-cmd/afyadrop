"use client";

import { useState } from "react";
import { api } from "@/lib/api";

const QUALIFICATIONS = [
  "Pharmacist",
  "Pharmacy Technician",
  "Nurse",
  "Clinical Officer",
  "Doctor",
  "Midwife",
  "Other",
];

export default function Register() {
  const [form, setForm] = useState({
    full_name: "",
    phone: "",
    qualification: QUALIFICATIONS[0],
    licence_number: "",
  });
  const [step, setStep] = useState<"form" | "otp">("form");
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
      setMessage(res.message ?? "OTP sent over WhatsApp");
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
      setMessage("Number verified. You can now buy credits and start ordering on WhatsApp.");
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="container">
      <div className="brand">Afya Drop</div>
      <div className="card">
        <h2>Create your account</h2>
        {step === "form" ? (
          <form onSubmit={onRegister}>
            <label htmlFor="full_name">Full name</label>
            <input id="full_name" value={form.full_name} onChange={update("full_name")} required />

            <label htmlFor="phone">Mobile number (WhatsApp)</label>
            <input id="phone" placeholder="07XXXXXXXX" value={form.phone} onChange={update("phone")} required />
            <div className="hint">Ugandan number. We will WhatsApp you a verification code.</div>

            <label htmlFor="qualification">Medical qualification</label>
            <select id="qualification" value={form.qualification} onChange={update("qualification")}>
              {QUALIFICATIONS.map((q) => (
                <option key={q} value={q}>{q}</option>
              ))}
            </select>

            <label htmlFor="licence_number">Practising licence number</label>
            <input id="licence_number" value={form.licence_number} onChange={update("licence_number")} required />

            <button disabled={loading}>{loading ? "Sending…" : "Register"}</button>
          </form>
        ) : (
          <form onSubmit={onVerify}>
            <label htmlFor="code">Enter the 6-digit code we sent to your WhatsApp</label>
            <input id="code" value={code} onChange={(e) => setCode(e.target.value)} maxLength={6} required />
            <button disabled={loading}>{loading ? "Verifying…" : "Verify"}</button>
          </form>
        )}
        {error && <div className="error">{error}</div>}
        {message && <div className="success">{message}</div>}
      </div>
    </main>
  );
}
