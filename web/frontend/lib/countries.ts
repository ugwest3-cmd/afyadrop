export interface FeaturedCountry {
  code: string;
  name: string;
  flag: string;
  body: string;
  status: "Live" | "Coming soon";
  flagPath: string;
}

export const FEATURED_COUNTRIES: FeaturedCountry[] = [
  { code: "US", name: "United States", flag: "US", body: "US Clinical Guidelines", status: "Live", flagPath: "/flags/us.svg" },
  { code: "GB", name: "United Kingdom", flag: "GB", body: "NICE Clinical Guidelines", status: "Live", flagPath: "/flags/gb.svg" },
  { code: "IN", name: "India", flag: "IN", body: "India Standard Treatment Guidelines", status: "Live", flagPath: "/flags/in.svg" },
  { code: "UG", name: "Uganda", flag: "UG", body: "Uganda Medical and Dental Practitioners Council", status: "Live", flagPath: "/flags/ug.svg" },
  { code: "KE", name: "Kenya", flag: "KE", body: "Kenya Medical Practitioners and Dentists Council", status: "Live", flagPath: "/flags/ke.svg" },
  { code: "ZA", name: "South Africa", flag: "ZA", body: "South Africa Standard Treatment Guidelines", status: "Live", flagPath: "/flags/za.svg" },
];
