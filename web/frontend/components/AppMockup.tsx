// In-app clinical Q&A mockup showcasing the Afya Drop mobile app — replaces
// the old WhatsApp chat mockup now that messaging happens inside the app.
export function AppMockup() {
  return (
    <div className="mx-auto w-full max-w-sm rounded-3xl border-8 border-teal-900 bg-white shadow-xl">
      <div className="flex items-center gap-3 bg-teal px-5 py-4 text-cream">
        <div className="flex h-9 w-9 items-center justify-center rounded-full bg-sage font-bold text-teal">A</div>
        <div>
          <p className="font-semibold">Afya Drop App</p>
          <p className="text-xs text-cream/70">Ask a clinical question</p>
        </div>
      </div>
      <div className="space-y-4 bg-cream p-4">
        <div className="ml-auto max-w-[85%] rounded-2xl rounded-tr-sm bg-sage p-3 text-sm text-teal shadow-sm">
          What are the first-line steps for treating uncomplicated malaria in an adult?
          <span className="mt-1 block text-right text-[10px] text-teal/50">10:42 AM</span>
        </div>
        <div className="max-w-[90%] rounded-2xl rounded-tl-sm bg-white p-3 text-sm leading-5 text-teal shadow-sm">
          Based on the Uganda Clinical Guidelines, confirm the diagnosis, assess severity, then use the recommended first-line antimalarial at the correct weight-based dose. Refer urgently if danger signs are present.
          <span className="mt-1 block text-right text-[10px] text-teal/50">10:42 AM ✓✓</span>
        </div>
        <div className="ml-auto flex max-w-[85%] items-center gap-2 rounded-2xl rounded-tr-sm bg-sage p-3 text-sm text-teal shadow-sm">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" aria-hidden>
            <rect x="3" y="5" width="18" height="14" rx="2" />
            <circle cx="9" cy="10" r="1.5" />
            <path d="m3 16 5-5 4 4 3-3 6 6" />
          </svg>
          Lab_report.jpg attached
        </div>
      </div>
    </div>
  );
}
