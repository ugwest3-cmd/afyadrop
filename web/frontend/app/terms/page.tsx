import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Terms of Service — Afya Drop",
  description: "The terms that govern your use of Afya Drop.",
};

const sections: Array<{ title: string; body: string[] }> = [
  {
    title: "1. The service",
    body: [
      "Afya Drop is a clinical decision-support assistant for qualified medical professionals in Uganda. You ask clinical questions over WhatsApp; answers are generated strictly from the Uganda Clinical Guidelines (UCG) and other reference documents we make available.",
      "Access is prepaid using credits purchased through our website (afyadrop.com).",
    ],
  },
  {
    title: "2. Eligibility & registration",
    body: [
      "You must be a qualified, licensed medical professional to use Afya Drop. During registration you provide your medical qualification and practising licence number, and verify your WhatsApp number.",
      "You are responsible for the accuracy of your registration details and for keeping your account secure.",
      "We may suspend or terminate accounts used fraudulently, abusively, or by persons who are not qualified medical professionals.",
    ],
  },
  {
    title: "3. Clinical disclaimer (important)",
    body: [
      "Afya Drop is a decision-SUPPORT tool. It does not provide a definitive diagnosis and is not a substitute for your professional clinical judgement.",
      "Answers are grounded in the Uganda Clinical Guidelines and uploaded references, but may be incomplete or not cover every situation. You remain fully responsible for all clinical decisions and patient care.",
      "If the guidelines do not cover a question, the assistant will say so. Always confirm against the full UCG and consult a senior clinician where appropriate.",
      "Do not use Afya Drop for medical emergencies.",
    ],
  },
  {
    title: "4. Credits & payments",
    body: [
      "1 credit = 100 UGX. Minimum purchase is 1,000 UGX (10 credits).",
      "Each clinical question answered costs 1 credit. A credit is deducted only when an answer is successfully delivered.",
      "Credits are non-transferable and, except where required by law, non-refundable.",
      "Payments are processed by PesaPal. We do not store your mobile money PIN or card details.",
    ],
  },
  {
    title: "5. Acceptable use",
    body: [
      "Do not send patient-identifiable information in your questions.",
      "Do not misuse the service, attempt to reverse-engineer it, or use it for unlawful purposes.",
      "You must have the right to use the WhatsApp number you register with.",
    ],
  },
  {
    title: "6. Intellectual property",
    body: [
      "The Afya Drop name, logo, website, and underlying software are our property. The Uganda Clinical Guidelines remain the property of their respective rights holder.",
    ],
  },
  {
    title: "7. Limitation of liability",
    body: [
      "To the maximum extent permitted by law, Afya Drop is provided \"as is\" and we are not liable for clinical outcomes, or for indirect or consequential losses arising from use of the service.",
      "Nothing in these terms excludes liability that cannot be excluded under Ugandan law.",
    ],
  },
  {
    title: "8. Termination",
    body: [
      "You may stop using Afya Drop at any time. We may suspend or terminate access for breach of these terms.",
    ],
  },
  {
    title: "9. Governing law & contact",
    body: [
      "These terms are governed by the laws of Uganda.",
      "Questions: legal@afyadrop.com.",
    ],
  },
  {
    title: "10. Changes",
    body: ["We may update these terms. Continued use after changes constitutes acceptance."],
  },
];

export default function Terms() {
  return (
    <main className="bg-cream py-14 sm:py-20">
      <div className="container-site max-w-3xl">
        <h1 className="text-4xl font-bold text-teal">Terms of Service</h1>
        <p className="mt-2 text-sm text-muted">Effective date: 1 January 2026 · Last updated: 1 January 2026</p>
        <div className="mt-10 space-y-8">
          {sections.map((s) => (
            <section key={s.title}>
              <h2 className="text-xl font-bold text-teal">{s.title}</h2>
              {s.body.map((p, i) => (
                <p key={i} className="mt-2 leading-relaxed text-ink/80">{p}</p>
              ))}
            </section>
          ))}
        </div>
      </div>
    </main>
  );
}
