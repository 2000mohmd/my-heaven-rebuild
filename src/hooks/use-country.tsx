import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import { useQuery } from "@tanstack/react-query";
import { getCountryPricing, type PricingRow } from "@/lib/pricing.functions";
import {
  COUNTRIES,
  COUNTRY_COOKIE,
  DEFAULT_COUNTRY,
  isCountryCode,
  formatPrice,
  type CountryCode,
} from "@/lib/country";

type Ctx = {
  country: CountryCode | null; // null = not chosen yet (show modal)
  setCountry: (c: CountryCode) => void;
  info: (typeof COUNTRIES)[CountryCode];
  format: (amount: number) => string;
  pricing: Map<number, { price: number; available: boolean }>;
  isPricingLoading: boolean;
};

const CountryCtx = createContext<Ctx | null>(null);

function readCookie(): CountryCode | null {
  if (typeof document === "undefined") return null;
  const m = document.cookie.match(new RegExp(`(?:^|; )${COUNTRY_COOKIE}=([^;]+)`));
  const v = m ? decodeURIComponent(m[1]) : "";
  return isCountryCode(v) ? v : null;
}

function writeCookie(c: CountryCode) {
  const maxAge = 60 * 60 * 24 * 90;
  document.cookie = `${COUNTRY_COOKIE}=${c}; path=/; max-age=${maxAge}; SameSite=Lax`;
}

export function CountryProvider({ children }: { children: ReactNode }) {
  const [country, setCountryState] = useState<CountryCode | null>(null);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    setCountryState(readCookie());
    setHydrated(true);
  }, []);

  const setCountry = useCallback((c: CountryCode) => {
    writeCookie(c);
    setCountryState(c);
  }, []);

  const { data: rows = [], isLoading } = useQuery({
    queryKey: ["country-pricing", country ?? "none"],
    queryFn: () => (country ? getCountryPricing({ data: { country } }) : Promise.resolve([] as PricingRow[])),
    enabled: !!country,
    staleTime: 60_000,
  });

  const pricing = useMemo(() => {
    const m = new Map<number, { price: number; available: boolean }>();
    for (const r of rows) m.set(r.product_id, { price: Number(r.price), available: r.available });
    return m;
  }, [rows]);

  const effective: CountryCode = country ?? DEFAULT_COUNTRY;
  const value: Ctx = {
    country: hydrated ? country : DEFAULT_COUNTRY,
    setCountry,
    info: COUNTRIES[effective],
    format: (n) => formatPrice(n, effective),
    pricing,
    isPricingLoading: isLoading,
  };
  return <CountryCtx.Provider value={value}>{children}</CountryCtx.Provider>;
}

export function useCountry() {
  const c = useContext(CountryCtx);
  if (!c) throw new Error("useCountry outside CountryProvider");
  return c;
}

/** Apply country override to a Woo product. Returns null if unavailable/no override. */
export function applyOverride(
  productId: number,
  basePrice: string,
  pricing: Map<number, { price: number; available: boolean }>,
): { price: number; available: boolean } | null {
  const o = pricing.get(productId);
  if (!o) return null; // hide products without an override
  if (!o.available) return { price: o.price, available: false };
  return { price: o.price, available: true };
}
