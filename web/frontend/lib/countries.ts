export interface AfyaCountry {
  code: string;
  name: string;
  flag: string;
  body: string;
  whatsapp: string;
  status: "Live" | "Coming soon";
  flagPath: string;
}

export const AFRICAN_COUNTRIES: AfyaCountry[] = [
  { code: "UG", name: "Uganda", flag: "UG", body: "Uganda Medical and Dental Practitioners Council", whatsapp: "+256 700 000000", status: "Live", flagPath: "/flags/ug.svg" },
  { code: "KE", name: "Kenya", flag: "KE", body: "Kenya Medical Practitioners and Dentists Council", whatsapp: "+256 700 000000", status: "Live", flagPath: "/flags/ke.svg" },
  { code: "TZ", name: "Tanzania", flag: "TZ", body: "Medical Council of Tanganyika", whatsapp: "+256 700 000000", status: "Live", flagPath: "/flags/tz.svg" },
  { code: "RW", name: "Rwanda", flag: "RW", body: "Rwanda Medical and Dental Council", whatsapp: "+256 700 000000", status: "Live", flagPath: "/flags/rw.svg" },
  { code: "ZM", name: "Zambia", flag: "ZM", body: "Health Professions Council of Zambia", whatsapp: "+256 700 000000", status: "Live", flagPath: "/flags/zm.svg" },
];
