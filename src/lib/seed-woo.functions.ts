import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

type WooImg = { id: number; src: string; alt: string };
type WooCat = { id: number; name: string; slug: string; image?: { src: string } | null };
type WooProduct = {
  id: number;
  slug: string;
  name: string;
  price: string;
  regular_price: string;
  sale_price: string;
  on_sale: boolean;
  stock_status: string;
  short_description: string;
  description: string;
  images: WooImg[];
  categories: { id: number; name: string; slug: string }[];
  average_rating: string;
  rating_count: number;
  menu_order?: number;
};
type WooReview = {
  id: number;
  date_created: string;
  product_id: number;
  reviewer: string;
  review: string;
  rating: number;
  verified: boolean;
  status?: string;
};

async function wooFetch(path: string): Promise<unknown> {
  const lovableKey = process.env.LOVABLE_API_KEY;
  const wooKey = process.env.WOOCOMMERCE_API_KEY;
  if (!lovableKey || !wooKey) {
    throw new Error("Woo import needs the WooCommerce connector to be linked to this project.");
  }
  const res = await fetch(`https://connector-gateway.lovable.dev/woocommerce${path}`, {
    headers: {
      Authorization: `Bearer ${lovableKey}`,
      "X-Connection-Api-Key": wooKey,
      Accept: "application/json",
    },
  });
  if (!res.ok) throw new Error(`Woo ${res.status}: ${(await res.text()).slice(0, 200)}`);
  return res.json();
}


async function fetchAll<T>(path: string): Promise<T[]> {
  const out: T[] = [];
  let page = 1;
  const per = 100;
  while (true) {
    const sep = path.includes("?") ? "&" : "?";
    const batch = (await wooFetch(`${path}${sep}per_page=${per}&page=${page}`)) as T[];
    if (!Array.isArray(batch) || batch.length === 0) break;
    out.push(...batch);
    if (batch.length < per) break;
    page += 1;
    if (page > 20) break; // safety
  }
  return out;
}

export const seedFromWoo = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { data: isAdmin } = await context.supabase.rpc("has_role" as never, {
      _user_id: context.userId,
      _role: "admin",
    } as never);
    if (!isAdmin) throw new Error("Forbidden");

    // Use the authenticated admin user's client (RLS admin policies apply).
    // The service role key is opaque (sb_secret_) and cannot be used with PostgREST here.
    const supabaseAdmin = context.supabase;

    // ---- Categories ----
    const wooCats = await fetchAll<WooCat>("/products/categories?hide_empty=false");
    const realCats = wooCats.filter((c) => c.slug !== "uncategorized");
    const slugToUuid = new Map<string, string>();

    for (const c of realCats) {
      const { data: row, error } = await supabaseAdmin
        .from("categories")
        .upsert(
          {
            slug: c.slug,
            name: c.name,
            image_url: c.image?.src ?? null,
            sort_order: 0,
          },
          { onConflict: "slug" },
        )
        .select("id, slug")
        .single();
      if (error) throw new Error(`Category "${c.slug}": ${error.message}`);
      slugToUuid.set((row as { slug: string }).slug, (row as { id: string }).id);
    }

    // ---- Products ----
    const wooProducts = await fetchAll<WooProduct>("/products?status=publish");
    let productsImported = 0;

    for (const p of wooProducts) {
      const catSlug = p.categories.find((c) => c.slug !== "uncategorized")?.slug;
      const categoryUuid = catSlug ? slugToUuid.get(catSlug) ?? null : null;

      const { error } = await supabaseAdmin.from("products").upsert(
        {
          slug: p.slug,
          name: p.name,
          short_description: p.short_description ?? "",
          description: p.description ?? "",
          price: Number(p.regular_price || p.price || 0),
          sale_price: p.sale_price ? Number(p.sale_price) : null,
          on_sale: !!p.on_sale,
          stock_status: p.stock_status || "instock",
          images: p.images.map((im) => ({ src: im.src, alt: im.alt ?? "" })),
          category_id: categoryUuid,
          sort_order: p.menu_order ?? 0,
          published: true,
          average_rating: Number(p.average_rating || 0),
          rating_count: p.rating_count ?? 0,
        },
        { onConflict: "slug" },
      );
      if (error) throw new Error(`Product "${p.slug}": ${error.message}`);
      productsImported += 1;
    }

    // ---- Reviews (approved only) ----
    let reviewsImported = 0;
    try {
      const wooReviews = await fetchAll<WooReview>("/products/reviews?status=approved");
      // Map woo product id → slug via what we just imported.
      const slugByWooId = new Map<number, string>();
      for (const p of wooProducts) slugByWooId.set(p.id, p.slug);
      const slugs = Array.from(new Set(wooReviews.map((r) => slugByWooId.get(r.product_id)).filter(Boolean))) as string[];
      const idBySlug = new Map<string, number>();
      if (slugs.length) {
        const { data: prodRows } = await supabaseAdmin
          .from("products")
          .select("id, slug")
          .in("slug", slugs);
        for (const row of (prodRows ?? []) as Array<{ id: number; slug: string }>) {
          idBySlug.set(row.slug, row.id);
        }
      }
      for (const r of wooReviews) {
        const slug = slugByWooId.get(r.product_id);
        const pid = slug ? idBySlug.get(slug) : undefined;
        if (!pid) continue;
        const html = r.review ?? "";
        await supabaseAdmin.from("product_reviews").insert({
          product_id: pid,
          reviewer: r.reviewer,
          reviewer_email: `imported+${r.id}@heaven.local`,
          review: html.replace(/<[^>]+>/g, "").trim() || html,
          rating: r.rating,
          approved: true,
        });
        reviewsImported += 1;
      }
    } catch {
      // reviews are optional
    }

    return {
      ok: true,
      categories: realCats.length,
      products: productsImported,
      reviews: reviewsImported,
    };
  });
