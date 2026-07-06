import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

const GATEWAY = "https://connector-gateway.lovable.dev/woocommerce";

async function wc(path: string, init?: { method?: string; body?: string }) {
  const lovableKey = process.env.LOVABLE_API_KEY;
  const wcKey = process.env.WOOCOMMERCE_API_KEY;
  if (!lovableKey || !wcKey) {
    throw new Error("WooCommerce connector is not configured");
  }
  const res = await fetch(`${GATEWAY}${path}`, {
    method: init?.method ?? "GET",
    headers: {
      Authorization: `Bearer ${lovableKey}`,
      "X-Connection-Api-Key": wcKey,
      ...(init?.body ? { "Content-Type": "application/json" } : {}),
    },
    body: init?.body,
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

const orderSchema = z.object({
  billing: z.object({
    first_name: z.string().min(1),
    last_name: z.string().min(1),
    address_1: z.string().min(1),
    city: z.string().min(1),
    postcode: z.string().default(""),
    country: z.string().min(2),
    email: z.string().email(),
    phone: z.string().min(3),
  }),
  line_items: z.array(z.object({ product_id: z.number(), quantity: z.number().min(1) })).min(1),
});

export const createOrder = createServerFn({ method: "POST" })
  .inputValidator((d: unknown) => orderSchema.parse(d))
  .handler(async ({ data }) => {
    const body = JSON.stringify({
      payment_method: "cod",
      payment_method_title: "Cash on Delivery",
      set_paid: false,
      billing: data.billing,
      shipping: data.billing,
      line_items: data.line_items,
    });
    const order = await wc(`/orders`, { method: "POST", body });
    return { id: order.id as number, number: String(order.number ?? order.id), total: String(order.total ?? "") };
  });

export type WCReview = {
  id: number;
  date_created: string;
  product_id: number;
  reviewer: string;
  review: string;
  rating: number;
  verified: boolean;
};

export const getProductReviews = createServerFn({ method: "GET" })
  .inputValidator((d: { product_id: number }) => d)
  .handler(async ({ data }) => {
    const params = new URLSearchParams();
    params.set("product", String(data.product_id));
    params.set("per_page", "50");
    return (await wc(`/products/reviews?${params}`)) as WCReview[];
  });

const reviewSchema = z.object({
  product_id: z.number(),
  reviewer: z.string().min(1),
  reviewer_email: z.string().email(),
  review: z.string().min(1),
  rating: z.number().int().min(1).max(5),
});

export const createProductReview = createServerFn({ method: "POST" })
  .inputValidator((d: unknown) => reviewSchema.parse(d))
  .handler(async ({ data }) => {
    const body = JSON.stringify(data);
    const review = await wc(`/products/reviews`, { method: "POST", body });
    return review as WCReview;
  });

export type WCOrder = {
  id: number;
  number: string;
  status: string;
  currency: string;
  total: string;
  date_created: string;
  billing: {
    first_name: string;
    last_name: string;
    email: string;
    phone: string;
    city: string;
    country: string;
  };
  line_items: { id: number; name: string; quantity: number; total: string }[];
};

export const listOrders = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { data: isAdmin, error: roleError } = await context.supabase.rpc("has_role" as never, {
      _user_id: context.userId,
      _role: "admin",
    } as never);
    if (roleError) {
      console.error("[listOrders] has_role error:", roleError);
      throw new Error(`Role check failed: ${roleError.message}`);
    }
    if (!isAdmin) throw new Error("Forbidden");
    return (await wc(`/orders?per_page=50&orderby=date&order=desc`)) as WCOrder[];
  });


