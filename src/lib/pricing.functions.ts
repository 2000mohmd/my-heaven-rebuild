import { createServerFn } from "@tanstack/react-start";
import { createClient } from "@supabase/supabase-js";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import type { Database } from "@/integrations/supabase/types";
import { COUNTRY_CODES, type CountryCode } from "./country";

export type PricingRow = {
  product_id: number;
  country_code: CountryCode;
  price: number;
  available: boolean;
};

function publicClient() {
  return createClient(
    process.env.SUPABASE_URL!,
    process.env.SUPABASE_PUBLISHABLE_KEY!,
    { auth: { storage: undefined, persistSession: false, autoRefreshToken: false } },
  );
}

export const getCountryPricing = createServerFn({ method: "GET" })
  .inputValidator((d: { country: string }) => d)
  .handler(async ({ data }) => {
    const country = data.country.toUpperCase();
    if (!COUNTRY_CODES.includes(country as CountryCode)) return [] as PricingRow[];
    const sb = publicClient();
    const { data: rows, error } = await sb
      .from("country_pricing" as never)
      .select("product_id, country_code, price, available")
      .eq("country_code", country);
    if (error) throw new Error(error.message);
    return (rows ?? []) as unknown as PricingRow[];
  });

export const getAllCountryPricing = createServerFn({ method: "GET" }).handler(async () => {
  const sb = publicClient();
  const { data, error } = await sb
    .from("country_pricing" as never)
    .select("product_id, country_code, price, available");
  if (error) throw new Error(error.message);
  return (data ?? []) as unknown as PricingRow[];
});

const upsertSchema = z.object({
  product_id: z.number().int(),
  country_code: z.enum(["LB", "AE", "EG", "JO"]),
  price: z.number().min(0),
  available: z.boolean(),
});

export const upsertCountryPricing = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) => upsertSchema.parse(d))
  .handler(async ({ data, context }) => {
    const sb = context.supabase as unknown as ReturnType<typeof createClient<Database>>;
    const { error } = await sb
      .from("country_pricing" as never)
      .upsert(
        [{ ...data, updated_at: new Date().toISOString() }] as never,
        { onConflict: "product_id,country_code" },
      );
    if (error) throw new Error(error.message);
    return { ok: true };
  });
