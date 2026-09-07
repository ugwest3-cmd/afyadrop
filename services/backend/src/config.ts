export const config = {
  port: Number(process.env.PORT ?? 4000),
  supabaseUrl: process.env.SUPABASE_URL ?? "",
  supabaseServiceKey: process.env.SUPABASE_SERVICE_KEY ?? "",
  aiServiceUrl: (process.env.AFYA_DROP_AI_URL ?? "http://localhost:4001").replace(/\/$/, ""),
  internalSecret: process.env.INTERNAL_API_SECRET ?? "",
  supabaseAnonKey: process.env.SUPABASE_ANON_KEY ?? "",
  siteUrl: (process.env.SITE_URL ?? "https://afyadrop.com").replace(/\/$/, ""),
  creditPriceUsd: Number(process.env.CREDIT_PRICE_USD ?? 0.10),
  minPurchaseUsd: Number(process.env.MIN_PURCHASE_USD ?? 1.00),
  intasend: {
    publishableKey: process.env.INTASEND_PUBLISHABLE_KEY ?? "",
    secretKey: process.env.INTASEND_SECRET_KEY ?? "",
    isTest: process.env.INTASEND_IS_TEST === "true",
    callbackUrl: process.env.INTASEND_CALLBACK_URL ?? "",
  },
};
