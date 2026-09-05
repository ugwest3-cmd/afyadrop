import Link from "next/link";

export function PricingCard() {
  return (
    <div className="card mx-auto max-w-xl overflow-hidden border-2 border-sage-500 bg-white p-8 text-center sm:p-10">
      <span className="text-sm font-semibold uppercase tracking-[0.2em] text-teal-700">Simple pricing</span>
      <h3 className="mt-4 text-3xl font-bold text-teal">Pay as you go</h3>
      <p className="mx-auto mt-3 max-w-md text-muted">Start with 5 free credits, then only pay for the clinical questions you ask.</p>
      <div className="my-8 flex items-end justify-center gap-2">
        <span className="font-heading text-6xl font-bold text-teal">100</span>
        <span className="mb-2 text-lg font-semibold text-teal">UGX / question</span>
      </div>
      <div className="grid grid-cols-2 gap-3 text-left text-sm text-teal/80">
        <div className="rounded-xl bg-ivory p-4"><strong className="block text-teal">5 free</strong>credits on registration</div>
        <div className="rounded-xl bg-ivory p-4"><strong className="block text-teal">Mobile money</strong>secure PesaPal checkout</div>
      </div>
      <Link href="/register" className="btn-primary mt-8 w-full">Register and get started <span aria-hidden>→</span></Link>
    </div>
  );
}
