import { createServerFn } from "@tanstack/react-start";
import { getRequestHeader } from "@tanstack/react-start/server";
import { isCountryCode, DEFAULT_COUNTRY, type CountryCode } from "./country";

export const detectCountry = createServerFn({ method: "GET" }).handler(async () => {
  const cf = getRequestHeader("cf-ipcountry") ?? getRequestHeader("x-vercel-ip-country") ?? "";
  const code = cf.toUpperCase();
  const map: Record<string, CountryCode> = { LB: "LB", AE: "AE", EG: "EG", JO: "JO" };
  return { country: map[code] ?? DEFAULT_COUNTRY };
});

export { isCountryCode };
