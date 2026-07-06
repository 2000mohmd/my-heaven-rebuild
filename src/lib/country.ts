export const COUNTRIES = {
  LB: { name: "Lebanon", flag: "🇱🇧", currency: "USD", symbol: "$", locale: "en-US" },
  AE: { name: "United Arab Emirates", flag: "🇦🇪", currency: "AED", symbol: "AED", locale: "en-AE" },
  EG: { name: "Egypt", flag: "🇪🇬", currency: "EGP", symbol: "E£", locale: "en-EG" },
  JO: { name: "Jordan", flag: "🇯🇴", currency: "JOD", symbol: "JD", locale: "en-JO" },
} as const;

export type CountryCode = keyof typeof COUNTRIES;
export const COUNTRY_CODES = Object.keys(COUNTRIES) as CountryCode[];
export const DEFAULT_COUNTRY: CountryCode = "LB";

export function isCountryCode(v: unknown): v is CountryCode {
  return typeof v === "string" && v in COUNTRIES;
}

export function formatPrice(amount: number, country: CountryCode) {
  const c = COUNTRIES[country];
  const n = amount.toFixed(c.currency === "JOD" ? 3 : 2);
  return `${c.symbol} ${n}`;
}

export const COUNTRY_COOKIE = "hb_country";
