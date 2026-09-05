export const config = {
  port: Number(process.env.PORT ?? 4000),
  supabaseUrl: process.env.SUPABASE_URL ?? "",
  supabaseServiceKey: process.env.SUPABASE_SERVICE_KEY ?? "",
  aiServiceUrl: (process.env.AFYA_DROP_AI_URL ?? "http://localhost:4001").replace(/\/$/, ""),
  internalSecret: process.env.INTERNAL_API_SECRET ?? "",
  supabaseAnonKey: process.env.SUPABASE_ANON_KEY ?? "",
  siteUrl: (process.env.SITE_URL ?? "https://afyadrop.com").replace(/\/$/, ""),
  creditPriceUgx: Number(process.env.CREDIT_PRICE_UGX ?? 100),
  minPurchaseUgx: Number(process.env.MIN_PURCHASE_UGX ?? 1000),
  pesapal: {
    consumerKey: process.env.PESAPAL_CONSUMER_KEY ?? "",
    consumerSecret: process.env.PESAPAL_CONSUMER_SECRET ?? "",
    baseUrl: process.env.PESAPAL_BASE_URL ?? "https://cybqa.pesapal.com/pesapalv3", // sandbox
    ipnId: process.env.PESAPAL_IPN_ID ?? "",
    callbackUrl: process.env.PESAPAL_CALLBACK_URL ?? "",
  },
};
