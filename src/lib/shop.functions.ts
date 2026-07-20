import { createServerFn } from "@tanstack/react-start";
import { createClient } from "@supabase/supabase-js";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

// ================== Types (kept compatible with old WCProduct shape) ==================
export type WCImage = { id: number; src: string; alt: string };
export type WCCategory = { id: string; name: string; slug: string };
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
export type WCReview = {
  id: number | string;
  date_created: string;
  product_id: number;
  reviewer: string;
  review: string;
  rating: number;
  verified: boolean;
};
export type WCOrder = {
  id: string;
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
  line_items: { id: string; name: string; quantity: number; total: string }[];
};

// ================== Supabase clients ==================
function publicClient() {
  const key = process.env.SUPABASE_PUBLISHABLE_KEY!;
  return createClient(process.env.SUPABASE_URL!, key, {
    auth: { storage: undefined, persistSession: false, autoRefreshToken: false },
    global: {
      fetch: (input, init) => {
        const h = new Headers(init?.headers);
        if (key.startsWith("sb_") && h.get("Authorization") === `Bearer ${key}`) h.delete("Authorization");
        h.set("apikey", key);
        return fetch(input as RequestInfo, { ...init, headers: h });
      },
    },
  });
}

// ================== Row → WCProduct mapping ==================
type ProductRow = {
  id: number;
  slug: string;
  name: string;
  short_description: string;
  description: string;
  price: number | string;
  sale_price: number | string | null;
  on_sale: boolean;
  stock_status: string;
  images: { src: string; alt?: string }[] | null;
  average_rating: number | string;
  rating_count: number;
  category_id: string | null;
  published: boolean;
  sort_order: number;
};
type CategoryRow = { id: string; slug: string; name: string };

function toProduct(row: ProductRow, cat: CategoryRow | null): WCProduct {
  const images: WCImage[] = (row.images ?? []).map((im, i) => ({
    id: i,
    src: im.src,
    alt: im.alt ?? "",
  }));
  return {
    id: Number(row.id),
    name: row.name,
    slug: row.slug,
    permalink: `/shop/${row.slug}`,
    price: String(row.price),
    regular_price: String(row.price),
    sale_price: row.sale_price != null ? String(row.sale_price) : "",
    on_sale: !!row.on_sale,
    stock_status: row.stock_status,
    short_description: row.short_description ?? "",
    description: row.description ?? "",
    images,
    categories: cat ? [{ id: cat.id, name: cat.name, slug: cat.slug }] : [],
    average_rating: String(row.average_rating ?? "0"),
    rating_count: row.rating_count ?? 0,
  };
}

// ================== Products ==================
export const getProducts = createServerFn({ method: "GET" })
  .inputValidator((d: { category?: number | string; per_page?: number } | undefined) => d ?? {})
  .handler(async ({ data }) => {
    const sb = publicClient();
    const limit = data.per_page ?? 48;

    let categoryUuid: string | undefined;
    if (data.category !== undefined && data.category !== null && data.category !== "") {
      const { data: cat } = await sb
        .from("categories")
        .select("id")
        .eq("slug", String(data.category))
        .maybeSingle();
      if (cat?.id) categoryUuid = cat.id as string;
    }

    let query = sb
      .from("products")
      .select("*")
      .eq("published", true)
      .order("sort_order", { ascending: true })
      .limit(limit);
    if (categoryUuid) query = query.eq("category_id", categoryUuid);

    const { data: rows, error } = await query;
    if (error) throw new Error(error.message);
    const productRows = (rows ?? []) as unknown as ProductRow[];

    const catIds = Array.from(
      new Set(productRows.map((r) => r.category_id).filter((v): v is string => !!v)),
    );
    const cats = new Map<string, CategoryRow>();
    if (catIds.length) {
      const { data: catRows } = await sb
        .from("categories")
        .select("id, slug, name")
        .in("id", catIds);
      for (const c of (catRows ?? []) as unknown as CategoryRow[]) cats.set(c.id, c);
    }

    return productRows.map((r) => toProduct(r, r.category_id ? cats.get(r.category_id) ?? null : null));
  });

export const getProductBySlug = createServerFn({ method: "GET" })
  .inputValidator((d: { slug: string }) => d)
  .handler(async ({ data }) => {
    const sb = publicClient();
    const { data: row, error } = await sb
      .from("products")
      .select("*")
      .eq("slug", data.slug)
      .eq("published", true)
      .maybeSingle();
    if (error) throw new Error(error.message);
    if (!row) return null;
    const p = row as unknown as ProductRow;
    let cat: CategoryRow | null = null;
    if (p.category_id) {
      const { data: c } = await sb
        .from("categories")
        .select("id, slug, name")
        .eq("id", p.category_id)
        .maybeSingle();
      cat = (c as unknown as CategoryRow | null) ?? null;
    }
    return toProduct(p, cat);
  });

export const getCategories = createServerFn({ method: "GET" }).handler(async () => {
  const sb = publicClient();
  const { data, error } = await sb
    .from("categories")
    .select("id, slug, name")
    .order("sort_order", { ascending: true });
  if (error) throw new Error(error.message);
  return ((data ?? []) as unknown as CategoryRow[]).map((c): WCCategory => ({
    id: c.id,
    name: c.name,
    slug: c.slug,
  }));
});

// ================== Reviews ==================
export const getProductReviews = createServerFn({ method: "GET" })
  .inputValidator((d: { product_id: number }) => d)
  .handler(async ({ data }) => {
    const sb = publicClient();
    const { data: rows, error } = await sb
      .from("product_reviews")
      .select("id, product_id, reviewer, review, rating, created_at")
      .eq("product_id", data.product_id)
      .eq("approved", true)
      .order("created_at", { ascending: false });
    if (error) throw new Error(error.message);
    return ((rows ?? []) as unknown as Array<{
      id: string;
      product_id: number;
      reviewer: string;
      review: string;
      rating: number;
      created_at: string;
    }>).map((r): WCReview => ({
      id: r.id,
      date_created: r.created_at,
      product_id: Number(r.product_id),
      reviewer: r.reviewer,
      review: r.review,
      rating: r.rating,
      verified: false,
    }));
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
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { error } = await supabaseAdmin.from("product_reviews").insert({
      product_id: data.product_id,
      reviewer: data.reviewer,
      reviewer_email: data.reviewer_email,
      review: data.review,
      rating: data.rating,
      approved: false,
    });
    if (error) throw new Error(error.message);

    return {
      id: "pending",
      date_created: new Date().toISOString(),
      product_id: data.product_id,
      reviewer: data.reviewer,
      review: data.review,
      rating: data.rating,
      verified: false,
    } satisfies WCReview;
  });

// ================== Orders ==================
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
    const sb = publicClient();

    // Fetch product prices server-side (never trust client prices)
    const ids = data.line_items.map((li) => li.product_id);
    const { data: prods, error: pErr } = await sb
      .from("products")
      .select("id, name, price, sale_price, on_sale, stock_status, published")
      .in("id", ids);
    if (pErr) throw new Error(pErr.message);
    const priceMap = new Map<number, { name: string; price: number; available: boolean }>();
    for (const p of (prods ?? []) as unknown as Array<{
      id: number;
      name: string;
      price: number | string;
      sale_price: number | string | null;
      on_sale: boolean;
      stock_status: string;
      published: boolean;
    }>) {
      const unit = p.on_sale && p.sale_price != null ? Number(p.sale_price) : Number(p.price);
      priceMap.set(Number(p.id), {
        name: p.name,
        price: unit,
        available: p.published && p.stock_status === "instock",
      });
    }

    // Apply country override if present
    const { data: overrides } = await sb
      .from("country_pricing")
      .select("product_id, price, available")
      .eq("country_code", data.billing.country.toUpperCase())
      .in("product_id", ids);
    const overrideMap = new Map<number, { price: number; available: boolean }>();
    for (const o of (overrides ?? []) as unknown as Array<{
      product_id: number;
      price: number | string;
      available: boolean;
    }>) {
      overrideMap.set(Number(o.product_id), { price: Number(o.price), available: !!o.available });
    }

    let subtotal = 0;
    const lines: {
      product_id: number;
      product_name: string;
      unit_price: number;
      quantity: number;
      line_total: number;
    }[] = [];
    for (const li of data.line_items) {
      const base = priceMap.get(li.product_id);
      if (!base) throw new Error(`Product ${li.product_id} not found`);
      const ov = overrideMap.get(li.product_id);
      const unit = ov ? ov.price : base.price;
      const available = ov ? ov.available && base.available : base.available;
      if (!available) throw new Error(`Product "${base.name}" is unavailable in ${data.billing.country}`);
      const lineTotal = Number((unit * li.quantity).toFixed(2));
      subtotal += lineTotal;
      lines.push({
        product_id: li.product_id,
        product_name: base.name,
        unit_price: unit,
        quantity: li.quantity,
        line_total: lineTotal,
      });
    }
    subtotal = Number(subtotal.toFixed(2));

    const orderId = crypto.randomUUID();
    const orderNumber = `HB-${Date.now().toString(36).toUpperCase()}-${Math.random().toString(36).slice(2, 6).toUpperCase()}`;

    const { error: oErr } = await sb
      .from("orders")
      .insert({
        id: orderId,
        order_number: orderNumber,
        customer_first_name: data.billing.first_name,
        customer_last_name: data.billing.last_name,
        email: data.billing.email,
        phone: data.billing.phone,
        address: data.billing.address_1,
        city: data.billing.city,
        postcode: data.billing.postcode ?? "",
        country: data.billing.country.toUpperCase(),
        subtotal,
        total: subtotal,
        currency: "USD",
        payment_method: "cod",
        status: "pending",
      });
    if (oErr) throw new Error(oErr.message);

    const { error: iErr } = await sb
      .from("order_items")
      .insert(lines.map((l) => ({ order_id: orderId, ...l })));
    if (iErr) throw new Error(iErr.message);

    // Fire-and-forget WhatsApp notification via CallMeBot
    try {
      const apiKey = process.env.CALLMEBOT_API_KEY;
      const phone = process.env.CALLMEBOT_PHONE;
      if (apiKey && phone) {
        const itemsText = lines
          .map((l) => `• ${l.product_name} x${l.quantity} = ${l.line_total.toFixed(2)}`)
          .join("\n");
        const msg =
          `🛍️ New Heaven Beauty order ${orderNumber}\n` +
          `${data.billing.first_name} ${data.billing.last_name}\n` +
          `📞 ${data.billing.phone}\n` +
          `📍 ${data.billing.address_1}, ${data.billing.city}, ${data.billing.country.toUpperCase()}\n` +
          `${itemsText}\n` +
          `Total: ${subtotal.toFixed(2)} USD (COD)`;
        const url =
          `https://api.callmebot.com/whatsapp.php?phone=${encodeURIComponent(phone)}` +
          `&text=${encodeURIComponent(msg)}&apikey=${encodeURIComponent(apiKey)}`;
        await fetch(url).catch((e) => console.error("[callmebot]", e));
      }
    } catch (e) {
      console.error("[whatsapp-notify]", e);
    }

    return { id: Number.NaN, uuid: orderId, number: orderNumber, total: String(subtotal) };
  });

// ================== Admin: update order status ==================
const ORDER_STATUSES = ["pending", "processing", "shipped", "delivered", "cancelled", "refunded"] as const;
const updateStatusSchema = z.object({
  order_id: z.string().uuid(),
  status: z.enum(ORDER_STATUSES),
});
export type OrderStatus = (typeof ORDER_STATUSES)[number];
export const orderStatuses = ORDER_STATUSES;

export const updateOrderStatus = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) => updateStatusSchema.parse(d))
  .handler(async ({ data, context }) => {
    const { data: isAdmin, error: roleError } = await context.supabase.rpc("has_role" as never, {
      _user_id: context.userId,
      _role: "admin",
    } as never);
    if (roleError) throw new Error(`Role check failed: ${roleError.message}`);
    if (!isAdmin) throw new Error("Forbidden");

    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { error } = await supabaseAdmin
      .from("orders")
      .update({ status: data.status })
      .eq("id", data.order_id);
    if (error) throw new Error(error.message);
    return { ok: true, id: data.order_id, status: data.status };
  });


// ================== Admin: list orders ==================
export const listOrders = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { data: isAdmin, error: roleError } = await context.supabase.rpc("has_role" as never, {
      _user_id: context.userId,
      _role: "admin",
    } as never);
    if (roleError) throw new Error(`Role check failed: ${roleError.message}`);
    if (!isAdmin) throw new Error("Forbidden");

    const sb = context.supabase as unknown as ReturnType<typeof createClient>;
    const { data: orders, error } = await sb
      .from("orders")
      .select("*, order_items(id, product_name, quantity, line_total)")
      .order("created_at", { ascending: false })
      .limit(50);
    if (error) throw new Error(error.message);

    return ((orders ?? []) as unknown as Array<{
      id: string;
      order_number: string;
      status: string;
      currency: string;
      total: number | string;
      created_at: string;
      customer_first_name: string;
      customer_last_name: string;
      email: string;
      phone: string;
      city: string;
      country: string;
      order_items: { id: string; product_name: string; quantity: number; line_total: number | string }[];
    }>).map((o): WCOrder => ({
      id: o.id,
      number: o.order_number,
      status: o.status,
      currency: o.currency,
      total: String(o.total),
      date_created: o.created_at,
      billing: {
        first_name: o.customer_first_name,
        last_name: o.customer_last_name,
        email: o.email,
        phone: o.phone,
        city: o.city,
        country: o.country,
      },
      line_items: (o.order_items ?? []).map((li) => ({
        id: li.id,
        name: li.product_name,
        quantity: li.quantity,
        total: String(li.line_total),
      })),
    }));
  });
