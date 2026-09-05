import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Privacy Policy — Afya Drop",
  description: "How Afya Drop collects, uses, and protects your personal information.",
};

const sections: Array<{ title: string; body: string[] }> = [
  {
    title: "1. Who we are",
    body: [
      "Afya Drop (\"we\", \"us\", \"our\") provides a clinical decision-support assistant for qualified medical professionals in Uganda, accessible via WhatsApp. Our website is afyadrop.com.",
      "This Privacy Policy explains what information we collect, why, and how we protect it.",
    ],
  },
  {
    title: "2. Information we collect",
    body: [
      "Account information: full name, mobile (WhatsApp) number, medical qualification, and practising licence number, provided when you register.",
      "Usage data: the clinical questions you ask, the answers returned, and timestamps (our Q&A log).",
      "Payment data: credit purchases are processed by PesaPal. We store the transaction amount, credits purchased, and status — we do not store your mobile money PIN or card details.",
      "Technical data: basic device/browser information and cookies needed to operate the website.",
    ],
  },
  {
    title: "3. How we use your information",
    body: [
      "To verify that you are a qualified medical professional.",
      "To operate the credit wallet and process payments.",
      "To answer your clinical questions over WhatsApp and improve the service.",
      "To send service messages (verification codes, low-balance and purchase confirmations).",
      "To meet legal and regulatory obligations.",
    ],
  },
  {
    title: "4. What we do NOT do",
    body: [
      "We do not collect patient-identifiable information. Please do not send patient names or identifying details in your questions.",
      "We do not sell your personal data to third parties.",
      "We do not use your questions to identify or profile individual patients.",
    ],
  },
  {
    title: "5. Data sharing",
    body: [
      "We share data only with the service providers needed to run Afya Drop: Supabase (database), Groq (AI inference), PesaPal (payments), and WhatsApp (message delivery). Each is bound by its own data-protection terms.",
      "We may disclose information if required by Ugandan law or a lawful request by a regulator.",
    ],
  },
  {
    title: "6. Data retention & security",
    body: [
      "We retain account and transaction records for as long as your account is active and as required by law.",
      "We use industry-standard safeguards (encrypted connections, access controls, row-level security on our database).",
    ],
  },
  {
    title: "7. Your rights",
    body: [
      "You may request access to, correction of, or deletion of your personal data by contacting us.",
      "You may close your account at any time; unused credits are handled per our Terms of Service.",
    ],
  },
  {
    title: "8. Contact",
    body: [
      "Questions about this policy: privacy@afyadrop.com.",
      "This policy is governed by the laws of Uganda, including the Data Protection and Privacy Act, 2019.",
    ],
  },
  {
    title: "9. Changes",
    body: ["We may update this policy. We will post the new version here with an updated effective date."],
  },
];

export default function Privacy() {
  return (
    <main className="bg-cream py-14 sm:py-20">
      <div className="container-site max-w-3xl">
        <h1 className="text-4xl font-bold text-teal">Privacy Policy</h1>
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
