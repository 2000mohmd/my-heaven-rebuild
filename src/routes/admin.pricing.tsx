import { createFileRoute } from "@tanstack/react-router";
import { queryOptions, useMutation, useQuery, useQueryClient, useSuspenseQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { useEffect, useState } from "react";
import { Check, Loader2 } from "lucide-react";
import { getProducts, type WCProduct } from "@/lib/shop.functions";
import { getAllCountryPricing, upsertCountryPricing, type PricingRow } from "@/lib/pricing.functions";
import { COUNTRIES, COUNTRY_CODES, type CountryCode } from "@/lib/country";

const productsQO = () =>
  queryOptions({ queryKey: ["admin", "products"], queryFn: () => getProducts({ data: { per_page: 100 } }) });

const pricingQO = () =>
  queryOptions({ queryKey: ["admin", "pricing"], queryFn: () => getAllCountryPricing() });

export const Route = createFileRoute("/admin/pricing")({
  loader: ({ context }) => {
    context.queryClient.ensureQueryData(productsQO());
    context.queryClient.ensureQueryData(pricingQO());
  },
  component: PricingPage,
});

type CellKey = `${number}:${CountryCode}`;

function PricingPage() {
  const { data: products } = useSuspenseQuery(productsQO());
  const { data: pricing } = useSuspenseQuery(pricingQO());

  const map = new Map<CellKey, PricingRow>();
  for (const r of pricing) map.set(`${r.product_id}:${r.country_code}` as CellKey, r);

  return (
    <div>
      <h1 className="font-display text-3xl">Products & Pricing</h1>
      <p className="mt-2 text-sm text-muted-foreground">
        Set a price for each country. Products with no price for a country are hidden from that country's shop.
      </p>

      <div className="mt-6 overflow-x-auto rounded-2xl border border-border bg-card">
        <table className="min-w-full text-sm">
          <thead className="bg-blush/30 text-xs uppercase tracking-widest text-foreground/70">
            <tr>
              <th className="px-4 py-3 text-left">Product</th>
              {COUNTRY_CODES.map((c) => (
                <th key={c} className="px-4 py-3 text-left">
                  {COUNTRIES[c].flag} {c} ({COUNTRIES[c].currency})
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {products.map((p) => (
              <tr key={p.id}>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-3">
                    {p.images[0] && (
                      <img src={p.images[0].src} alt="" className="h-10 w-10 rounded object-cover" />
                    )}
                    <div>
                      <div className="font-medium">{p.name}</div>
                      <div className="text-xs text-muted-foreground">Base: ${p.price}</div>
                    </div>
                  </div>
                </td>
                {COUNTRY_CODES.map((c) => (
                  <td key={c} className="px-4 py-3">
                    <PriceCell product={p} country={c} initial={map.get(`${p.id}:${c}` as CellKey)} />
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function PriceCell({
  product,
  country,
  initial,
}: {
  product: WCProduct;
  country: CountryCode;
  initial: PricingRow | undefined;
}) {
  const qc = useQueryClient();
  const upsert = useServerFn(upsertCountryPricing);
  const [price, setPrice] = useState(initial ? String(initial.price) : "");
  const [available, setAvailable] = useState(initial?.available ?? false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    setPrice(initial ? String(initial.price) : "");
    setAvailable(initial?.available ?? false);
  }, [initial]);

  const mutation = useMutation({
    mutationFn: () =>
      upsert({
        data: {
          product_id: product.id,
          country_code: country,
          price: Number(price) || 0,
          available,
        },
      }),
    onSuccess: () => {
      setSaved(true);
      setTimeout(() => setSaved(false), 1500);
      qc.invalidateQueries({ queryKey: ["admin", "pricing"] });
      qc.invalidateQueries({ queryKey: ["country-pricing"] });
    },
  });

  const save = () => {
    if (!price) return;
    mutation.mutate();
  };

  return (
    <div className="flex items-center gap-2">
      <input
        type="number"
        step="0.01"
        min="0"
        value={price}
        onChange={(e) => setPrice(e.target.value)}
        onBlur={save}
        placeholder="—"
        className="w-24 rounded border border-border bg-white/70 px-2 py-1.5 text-sm focus:border-primary focus:outline-none"
      />
      <label className="flex items-center gap-1 text-xs">
        <input
          type="checkbox"
          checked={available}
          onChange={(e) => {
            setAvailable(e.target.checked);
            setTimeout(save, 0);
          }}
        />
        On
      </label>
      {mutation.isPending && <Loader2 className="h-3.5 w-3.5 animate-spin text-muted-foreground" />}
      {saved && <Check className="h-3.5 w-3.5 text-primary" />}
    </div>
  );
}
