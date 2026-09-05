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
  { code: "KE", name: "Kenya", flag: "KE", body: "Kenya Medical Practitioners and Dentists Council", whatsapp: "Coming soon", status: "Coming soon", flagPath: "/flags/ke.svg" },
  { code: "TZ", name: "Tanzania", flag: "TZ", body: "Medical Council of Tanganyika", whatsapp: "Coming soon", status: "Coming soon", flagPath: "/flags/tz.svg" },
  { code: "RW", name: "Rwanda", flag: "RW", body: "Rwanda Medical and Dental Council", whatsapp: "Coming soon", status: "Coming soon", flagPath: "/flags/rw.svg" },
  { code: "BI", name: "Burundi", flag: "BI", body: "National Medical Council of Burundi", whatsapp: "Coming soon", status: "Coming soon", flagPath: "/flags/bi.svg" },
  { code: "SS", name: "South Sudan", flag: "SS", body: "South Sudan Medical Council", whatsapp: "Coming soon", status: "Coming soon", flagPath: "/flags/ss.svg" },
];
