import Link from "next/link";

export function Footer() {
  return (
    <footer className="border-t border-teal/10 bg-teal text-cream">
      <div className="container-site grid gap-10 py-14 sm:grid-cols-2 lg:grid-cols-4">
        <div className="lg:col-span-2">
          <div className="font-heading text-xl font-bold">AfyaDrop</div>
          <p className="mt-3 max-w-sm text-sm text-cream/70">
            Clinical decision-support for Ugandan medical professionals. Answers grounded in the
            Uganda Clinical Guidelines, delivered over WhatsApp.
          </p>
          <p className="mt-4 text-xs text-cream/50">
            Afya Drop is a decision-support aid for qualified clinicians. It is not a substitute for
            professional clinical judgement.
          </p>
        </div>

        <div>
          <div className="text-sm font-semibold uppercase tracking-wide text-sage">Product</div>
          <ul className="mt-3 space-y-2 text-sm text-cream/80">
            <li><Link href="/register" className="hover:text-sage">Register</Link></li>
            <li><Link href="/login" className="hover:text-sage">Login</Link></li>
            <li><Link href="/dashboard" className="hover:text-sage">Buy Credits</Link></li>
          </ul>
        </div>

        <div>
          <div className="text-sm font-semibold uppercase tracking-wide text-sage">Legal</div>
          <ul className="mt-3 space-y-2 text-sm text-cream/80">
            <li><Link href="/privacy" className="hover:text-sage">Privacy Policy</Link></li>
            <li><Link href="/terms" className="hover:text-sage">Terms of Service</Link></li>
          </ul>
        </div>
      </div>

      <div className="border-t border-cream/10">
        <div className="container-site flex flex-col items-center justify-between gap-2 py-5 text-xs text-cream/50 sm:flex-row">
          <span>© 2026 Afya Drop. All rights reserved.</span>
          <span>afyadrop.com</span>
        </div>
      </div>
    </footer>
  );
}
