// Supported countries. Each has a default clinical guideline that admins upload.
// dial: country calling code. localLen: typical national significant number length (without dial code).

export interface Country {
  code: string;      // ISO 3166-1 alpha-2
  name: string;
  dial: string;      // e.g. "1" or "44" or "256"
  guidelineName: string; // display name of the national clinical guideline
  currency: string;  // e.g. "USD", "UGX"
}

export const COUNTRIES: Country[] = [
  { code: "US", name: "United States", dial: "1", guidelineName: "US Clinical Guidelines", currency: "USD" },
  { code: "GB", name: "United Kingdom", dial: "44", guidelineName: "NICE Clinical Guidelines", currency: "GBP" },
  { code: "IN", name: "India", dial: "91", guidelineName: "India Standard Treatment Guidelines", currency: "INR" },
  { code: "UG", name: "Uganda", dial: "256", guidelineName: "Uganda Clinical Guidelines (UCG)", currency: "UGX" },
  { code: "KE", name: "Kenya", dial: "254", guidelineName: "Kenya Clinical Guidelines", currency: "KES" },
  { code: "TZ", name: "Tanzania", dial: "255", guidelineName: "Tanzania Standard Treatment Guidelines", currency: "TZS" },
  { code: "RW", name: "Rwanda", dial: "250", guidelineName: "Rwanda National Treatment Guidelines", currency: "RWF" },
  { code: "NG", name: "Nigeria", dial: "234", guidelineName: "Nigeria National Guidelines", currency: "NGN" },
  { code: "ZA", name: "South Africa", dial: "27", guidelineName: "South Africa Standard Treatment Guidelines", currency: "ZAR" },
];

export function getCountry(code: string): Country | undefined {
  return COUNTRIES.find((c) => c.code === code.toUpperCase());
}

// Normalize a phone into E.164 given the user's country.
// Accepts local ("07XXXXXXXX") or full international ("+2567XXXXXXXX", "2567XXXXXXXX").
export function normalizePhone(input: string, countryCode: string): string | null {
  const country = getCountry(countryCode);
  const digits = input.replace(/\D/g, "");
  if (!country) {
    // No country context: accept any E.164-looking international number.
    return /^\+?\d{9,15}$/.test(input.trim()) ? `+${digits}` : null;
  }
  // Already international with the right dial code
  if (digits.startsWith(country.dial)) {
    const national = digits.slice(country.dial.length);
    if (national.length >= 8 && national.length <= 11) return `+${digits}`;
  }
  // Local format starting with 0
  const national = digits.replace(/^0+/, "");
  if (national.length >= 8 && national.length <= 11) {
    return `+${country.dial}${national}`;
  }
  return null;
}
