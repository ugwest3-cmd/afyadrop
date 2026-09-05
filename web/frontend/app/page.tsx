import Link from "next/link";
import { StatCard } from "@/components/StatCard";
import { SectionHeading } from "@/components/SectionHeading";
import { CountryCard } from "@/components/CountryCard";
import { UseCaseCard } from "@/components/UseCaseCard";
import { WhatsAppMockup } from "@/components/WhatsAppMockup";
import { PricingCard } from "@/components/PricingCard";
import { AFRICAN_COUNTRIES } from "@/lib/countries";

const WHATSAPP_NUMBER = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER ?? "+256 700 000000";

export default function Home() {
  return (
    <main>
      <section className="pattern-africa bg-teal text-cream">
        <div className="container-site flex flex-col items-center py-24 text-center sm:py-32">
          <span className="rounded-full border border-sage/40 bg-sage/10 px-4 py-1.5 text-xs font-semibold uppercase tracking-[0.2em] text-sage">
            The African Medical Assistant
          </span>
          <h1 className="mt-6 max-w-3xl text-4xl font-bold leading-tight sm:text-6xl">
            Clinical answers you can trust. Instantly.
          </h1>
          <p className="mt-6 max-w-2xl text-lg text-cream/80">
            Evidence-based decision support grounded in your country's national clinical guidelines. Ask over WhatsApp.
            Get answers in seconds.
          </p>
          <div className="mt-10 flex flex-col gap-3 sm:flex-row">
            <Link href="/register" className="btn-primary text-lg">
              Register Now →
            </Link>
            <a href="#how-it-works" className="btn-secondary border-cream/40 text-cream hover:bg-cream hover:text-teal">
              How it works
            </a>
          </div>
        </div>
      </section>

      <section className="bg-cream py-16 sm:py-20">
        <div className="container-site grid grid-cols-2 gap-4 lg:grid-cols-4">
          <StatCard value="5 Free" label="Credits to start" sub="Every new account" />
          <StatCard value="Seconds" label="Response time" sub="Straight to your WhatsApp" />
          <StatCard value="Your country's" label="Guideline" sub="Every answer cites your national guideline" />
          <StatCard value="WhatsApp" label="No app needed" sub="Works on any phone" />
        </div>
      </section>

      <section id="countries" className="bg-cream py-20 sm:py-28">
        <div className="container-site">
          <SectionHeading tagline="East Africa, connected" heading="Clinical support that understands your country" />
          <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {AFRICAN_COUNTRIES.map((country) => <CountryCard key={country.code} country={country} />)}
          </div>
        </div>
      </section>

      <section id="use-cases" className="pattern-africa bg-ivory py-20 sm:py-28">
        <div className="container-site">
          <SectionHeading tagline="One tool, many moments" heading="What Afya Drop helps you do" />
          <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            <UseCaseCard icon="🩺" title="Diagnosis support">Describe symptoms and get guideline-based differential diagnosis suggestions.</UseCaseCard>
            <UseCaseCard icon="📋" title="Treatment plans">Find evidence-based treatment protocols from your national guidelines.</UseCaseCard>
            <UseCaseCard icon="💊" title="Drug dosing">Check accurate dosing guidance for adults and paediatric patients.</UseCaseCard>
            <UseCaseCard icon="⚠" title="Drug interactions">Check contraindications and interactions before prescribing.</UseCaseCard>
            <UseCaseCard icon="🔎" title="Medical conditions">Understand conditions with clear, practical guideline references.</UseCaseCard>
            <UseCaseCard icon="🚨" title="Emergency protocols">Reach emergency management guidance quickly when every second matters.</UseCaseCard>
          </div>
        </div>
      </section>

      <section id="how-it-works" className="bg-ivory py-20 sm:py-28">
        <div className="container-site">
          <SectionHeading tagline="How it works" heading="Three steps to better clinical decisions" />
          <div className="mt-14 grid items-center gap-12 lg:grid-cols-[1fr_auto]">
            <div className="grid gap-6 md:grid-cols-3">
              {[
              { n: "1", title: "Register", body: "Create your account with your medical qualification and practising licence number." },
              { n: "2", title: "Get 5 free credits", body: "Every new account starts with 5 free credits. Top up securely with mobile money via PesaPal when you need more." },
              { n: "3", title: "Ask on WhatsApp", body: `Send any clinical question to ${WHATSAPP_NUMBER} and get a guideline-grounded answer in seconds.` },
              ].map((s) => (
                <div key={s.n} className="card p-8">
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-sage font-heading text-xl font-bold text-teal">{s.n}</div>
                  <h3 className="mt-5 text-xl font-bold text-teal">{s.title}</h3>
                  <p className="mt-2 text-muted">{s.body}</p>
                </div>
              ))}
            </div>
            <WhatsAppMockup />
          </div>
        </div>
      </section>

      <section className="bg-cream py-20 sm:py-28">
        <div className="container-site grid items-center gap-12 lg:grid-cols-2">
          <div>
            <SectionHeading align="left" tagline="Why Afya Drop" heading="Built for the realities of African healthcare" />
            <ul className="mt-8 space-y-5">
              {[
                { title: "Your country's guideline", body: "Answers come strictly from your own national clinical guideline and other references our admins upload — never from unverified external sources." },
                { title: "Made for Africa", body: "Works over WhatsApp on any phone, priced for local realities, designed around local qualifications and prescribing practice." },
                { title: "Safe by design", body: "Every answer carries a decision-support disclaimer. If the guidelines don't cover a question, Afya Drop says so." },
              ].map((f) => (
                <li key={f.title} className="flex gap-4">
                  <span className="mt-1 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-sage text-sm font-bold text-teal">✓</span>
                  <div>
                    <div className="font-semibold text-teal">{f.title}</div>
                    <div className="text-sm text-muted">{f.body}</div>
                  </div>
                </li>
              ))}
            </ul>
          </div>
          <div className="card flex min-h-[280px] items-center justify-center bg-teal p-10 text-center">
            <div>
              <div className="font-heading text-5xl font-bold text-sage">{WHATSAPP_NUMBER}</div>
              <p className="mt-4 text-cream/80">Save the number. Ask anything clinical.<br />That's the whole product.</p>
            </div>
          </div>
        </div>
      </section>

      <section id="pricing" className="bg-ivory py-20 sm:py-28">
        <div className="container-site">
          <SectionHeading tagline="Accessible by design" heading="Clinical guidance should be within reach" />
          <div className="mt-10"><PricingCard /></div>
        </div>
      </section>

      <section className="bg-cream py-20">
        <div className="container-site text-center">
          <SectionHeading tagline="Trusted by the people who use it" heading="Built around the realities of clinical work" />
          <div className="mx-auto mt-10 grid max-w-3xl gap-4 sm:grid-cols-3">
            {["Guideline grounded", "Made for local practice", "Decision support first"].map((item) => (
              <div key={item} className="rounded-xl border border-teal/10 bg-ivory p-5 text-sm font-semibold text-teal">{item}</div>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-sage py-16 sm:py-20">
        <div className="container-site flex flex-col items-center gap-6 text-center">
          <h2 className="max-w-2xl text-3xl font-bold text-teal sm:text-4xl">Ready to get started?</h2>
          <p className="max-w-xl text-teal/80">Register in two minutes, get 5 free credits, and ask your first question today.</p>
          <Link href="/register" className="btn bg-teal text-cream hover:bg-teal-800 text-lg">
            Register Now →
          </Link>
        </div>
      </section>
    </main>
  );
}
