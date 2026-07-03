import { createServerFn } from "@tanstack/react-start";

const GATEWAY = "https://connector-gateway.lovable.dev/woocommerce";

async function wc(path: string) {
  const lovableKey = process.env.LOVABLE_API_KEY;
  const wcKey = process.env.WOOCOMMERCE_API_KEY;
  if (!lovableKey || !wcKey) {
    throw new Error("WooCommerce connector is not configured");
  }
  const res = await fetch(`${GATEWAY}${path}`, {
    headers: {
      Authorization: `Bearer ${lovableKey}`,
      "X-Connection-Api-Key": wcKey,
    },
  });
  if (!res.ok) {
    const body = await res.text();
    throw new Error(`WooCommerce error [${res.status}]: ${body.slice(0, 300)}`);
  }
  return res.json();
}

export type WCImage = { id: number; src: string; alt: string };
export type WCCategory = { id: number; name: string; slug: string };
export type WCProduct = {
  id: number;
  name: string;
  slug: string;
  permalink: string;
  price: string;
  regular_price: string;
  sale_price: string;
  on_sale: boolean;
  stock_status: string;
  short_description: string;
  description: string;
  images: WCImage[];
  categories: WCCategory[];
  average_rating: string;
  rating_count: number;
};

export const getProducts = createServerFn({ method: "GET" })
  .inputValidator((d: { category?: number; per_page?: number } | undefined) => d ?? {})
  .handler(async ({ data }) => {
    const params = new URLSearchParams();
    params.set("per_page", String(data.per_page ?? 24));
    params.set("status", "publish");
    if (data.category) params.set("category", String(data.category));
    return (await wc(`/products?${params}`)) as WCProduct[];
  });

export const getProductBySlug = createServerFn({ method: "GET" })
  .inputValidator((d: { slug: string }) => d)
  .handler(async ({ data }) => {
    const results = (await wc(`/products?slug=${encodeURIComponent(data.slug)}`)) as WCProduct[];
    return results[0] ?? null;
  });

export const getCategories = createServerFn({ method: "GET" }).handler(async () => {
  const cats = (await wc(`/products/categories?per_page=50&hide_empty=true`)) as WCCategory[];
  return cats.filter((c) => c.slug !== "uncategorized");
});
