export function WhatsAppMockup() {
  return (
    <div className="mx-auto w-full max-w-sm rounded-3xl border-8 border-teal-900 bg-[#e7f1e8] shadow-xl">
      <div className="flex items-center gap-3 bg-teal px-5 py-4 text-cream">
        <div className="flex h-9 w-9 items-center justify-center rounded-full bg-sage font-bold text-teal">A</div>
        <div>
          <p className="font-semibold">Afya Drop</p>
          <p className="text-xs text-cream/70">online</p>
        </div>
      </div>
      <div className="space-y-4 bg-[linear-gradient(135deg,#e7f1e8_25%,#dcebdc_25%,#dcebdc_50%,#e7f1e8_50%,#e7f1e8_75%,#dcebdc_75%)] bg-[length:32px_32px] p-4">
        <div className="ml-auto max-w-[85%] rounded-2xl rounded-tr-sm bg-[#d3f8c6] p-3 text-sm text-teal shadow-sm">
          What are the first-line steps for treating uncomplicated malaria in an adult?
          <span className="mt-1 block text-right text-[10px] text-teal/50">10:42 AM</span>
        </div>
        <div className="max-w-[90%] rounded-2xl rounded-tl-sm bg-white p-3 text-sm leading-5 text-teal shadow-sm">
          Based on the Uganda Clinical Guidelines, confirm the diagnosis, assess severity, then use the recommended first-line antimalarial at the correct weight-based dose. Refer urgently if danger signs are present.
          <span className="mt-1 block text-right text-[10px] text-teal/50">10:42 AM ✓✓</span>
        </div>
      </div>
    </div>
  );
}
