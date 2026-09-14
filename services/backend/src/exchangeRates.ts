let ratesCache: Record<string, number> | null = null;
let lastFetch = 0;
const CACHE_TTL = 1000 * 60 * 60 * 12; // 12 hours

export async function getExchangeRate(targetCurrency: string): Promise<number> {
  const currency = targetCurrency.toUpperCase();
  if (currency === "USD") return 1;

  const now = Date.now();
  if (!ratesCache || now - lastFetch > CACHE_TTL) {
    try {
      const res = await fetch("https://open.er-api.com/v6/latest/USD");
      if (res.ok) {
        const data: any = await res.json();
        if (data && data.rates) {
          ratesCache = data.rates;
          lastFetch = now;
        }
      } else {
        console.error("Exchange rate API error", res.status);
      }
    } catch (err) {
      console.error("Failed to fetch exchange rates", err);
    }
  }

  if (ratesCache && ratesCache[currency]) {
    return ratesCache[currency];
  }

  throw new Error(`Exchange rate for ${currency} not found`);
}
