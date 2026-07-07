import { createFileRoute, Link, notFound, useRouter } from "@tanstack/react-router";
import { queryOptions, useSuspenseQuery, useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { useState, type FormEvent } from "react";
import { Minus, Plus, ShoppingBag, ArrowLeft, Star } from "lucide-react";
import { getProductBySlug, getProductReviews, createProductReview } from "@/lib/woocommerce.functions";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { addToCart } from "@/lib/cart";
import { useCountry } from "@/hooks/use-country";


const productQO = (slug: string) =>
  queryOptions({
    queryKey: ["product", slug],
    queryFn: () => getProductBySlug({ data: { slug } }),
  });

export const Route = createFileRoute("/shop/$slug")({
  loader: async ({ context, params }) => {
    const product = await context.queryClient.ensureQueryData(productQO(params.slug));
    if (!product) throw notFound();
    return product;
  },
  head: ({ loaderData, params }) => {
    const title = params?.slug
      ? `${params.slug.replace(/-/g, " ")} — Heaven Beauty`
      : "Product — Heaven Beauty";

    const productName = loaderData?.name ?? params?.slug?.replace(/-/g, " ") ?? "this product";
    const rawSnippet = loaderData?.short_description
      ? loaderData.short_description.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim()
      : "";
    const snippet = rawSnippet.length > 120 ? rawSnippet.slice(0, 117) + "..." : rawSnippet;

    let description = snippet
      ? `Shop ${productName} at Heaven Beauty. ${snippet}`
      : `Shop ${productName} at Heaven Beauty — soft, radiant tints and blushes to enhance your natural glow.`;

    if (description.length > 160) description = description.slice(0, 157) + "...";
    if (description.length < 50) {
      description = `Shop ${productName} and more beauty essentials at Heaven Beauty. Discover soft, radiant tints for your natural glow.`;
    }

    const image = loaderData?.images?.[0]?.src;
    const price = loaderData?.price ? String(loaderData.price) : undefined;
    const availability =
      loaderData?.stock_status === "instock"
        ? "https://schema.org/InStock"
        : "https://schema.org/OutOfStock";

    const productLd = loaderData
      ? {
          "@context": "https://schema.org",
          "@type": "Product",
          name: loaderData.name,
          description: rawSnippet || description,
          image: image ? [image] : undefined,
          sku: String(loaderData.id),
          brand: { "@type": "Brand", name: "Heaven Beauty" },
          offers: price
            ? {
                "@type": "Offer",
                price,
                priceCurrency: "USD",
                availability,
                url: `https://my-heaven-rebuild.lovable.app/shop/${params.slug}`,
              }
            : undefined,
        }
      : null;

    return {
      meta: [
        { title },
        { name: "description", content: description },
        { property: "og:title", content: title },
        { property: "og:description", content: description },
        ...(image ? [{ property: "og:image", content: image } as const] : []),
        { property: "og:type", content: "product" },
      ],
      links: [
        { rel: "canonical", href: `https://my-heaven-rebuild.lovable.app/shop/${params.slug}` },
      ],
      scripts: productLd
        ? [{ type: "application/ld+json", children: JSON.stringify(productLd) }]
        : undefined,
    };
  },
  component: ProductPage,
  notFoundComponent: () => {
    const { slug } = Route.useParams();
    return (
      <div className="min-h-screen">
        <SiteHeader />
        <div className="mx-auto max-w-xl p-20 text-center">
          <h1 className="font-display text-3xl">Product not found</h1>
          <p className="mt-2 text-muted-foreground">We couldn't find "{slug}".</p>
          <Link to="/shop" className="mt-6 inline-block rounded-full bg-primary px-5 py-2 text-primary-foreground">
            Back to shop
          </Link>
        </div>
      </div>
    );
  },
  errorComponent: ({ error, reset }) => {
    const router = useRouter();
    return (
      <div className="mx-auto max-w-xl p-10 text-center">
        <h2 className="font-display text-2xl">Something went wrong</h2>
        <p className="mt-2 text-sm text-muted-foreground">{error.message}</p>
        <button
          onClick={() => {
            router.invalidate();
            reset();
          }}
          className="mt-4 rounded-full bg-primary px-5 py-2 text-sm text-primary-foreground"
        >
          Try again
        </button>
      </div>
    );
  },
});

function ProductPage() {
  const { slug } = Route.useParams();
  const { data: product } = useSuspenseQuery(productQO(slug));
  const { pricing, format, info } = useCountry();
  const [qty, setQty] = useState(1);
  const [imgIdx, setImgIdx] = useState(0);
  const [added, setAdded] = useState(false);

  if (!product) return null;
  const override = pricing.get(product.id);
  const price = override ? override.price : Number(product.price);
  const inStock = product.stock_status === "instock" && !!override && override.available;
  const notInCountry = !override || !override.available;

  const handleAdd = () => {
    if (!inStock) return;
    addToCart(
      {
        id: product.id,
        slug: product.slug,
        name: product.name,
        price: String(price),
        image: product.images[0]?.src ?? "",
      },
      qty,
    );
    setAdded(true);
    setTimeout(() => setAdded(false), 1800);
  };

  return (
    <div className="min-h-screen">
      <SiteHeader />

      <div className="mx-auto max-w-7xl px-4 pt-24 pb-4 md:px-8 md:pt-32">
        <Link to="/shop" className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-primary">
          <ArrowLeft className="h-4 w-4" /> Back to shop
        </Link>
      </div>

      <section className="mx-auto grid max-w-7xl gap-12 px-4 pb-20 md:grid-cols-2 md:px-8">
        <div>
          <div className="aspect-square overflow-hidden rounded-3xl bg-blush/40">
            {product.images[imgIdx] && (
              <img
                src={product.images[imgIdx].src}
                alt={product.name}
                className="h-full w-full object-cover"
              />
            )}
          </div>
          {product.images.length > 1 && (
            <div className="mt-4 flex gap-3">
              {product.images.map((im, i) => (
                <button
                  key={im.id}
                  onClick={() => setImgIdx(i)}
                  className={
                    "h-20 w-20 overflow-hidden rounded-xl border-2 transition " +
                    (i === imgIdx ? "border-primary" : "border-transparent opacity-70 hover:opacity-100")
                  }
                >
                  <img src={im.src} alt="" className="h-full w-full object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="md:pt-4">
          {product.categories[0] && (
            <p className="text-xs uppercase tracking-widest text-primary">
              {product.categories[0].name}
            </p>
          )}
          <h1 className="mt-2 font-display text-4xl md:text-5xl">{product.name}</h1>
          <p className="mt-4 text-3xl font-semibold text-primary">{format(price)}</p>
          {notInCountry && (
            <p className="mt-2 text-sm text-destructive">Not available in {info.name} right now.</p>
          )}

          {product.short_description && (
            <div
              className="prose prose-sm mt-6 max-w-none text-foreground/80"
              dangerouslySetInnerHTML={{ __html: product.short_description }}
            />
          )}

          <div className="mt-8 flex items-center gap-4">
            <div className="flex items-center rounded-full border border-border">
              <button
                onClick={() => setQty(Math.max(1, qty - 1))}
                className="px-4 py-3 text-muted-foreground hover:text-foreground"
                aria-label="Decrease"
              >
                <Minus className="h-4 w-4" />
              </button>
              <span className="w-8 text-center text-sm font-medium">{qty}</span>
              <button
                onClick={() => setQty(qty + 1)}
                className="px-4 py-3 text-muted-foreground hover:text-foreground"
                aria-label="Increase"
              >
                <Plus className="h-4 w-4" />
              </button>
            </div>
            <button
              onClick={handleAdd}
              disabled={!inStock}
              className="inline-flex flex-1 items-center justify-center gap-2 rounded-full bg-primary px-8 py-3.5 text-sm font-medium text-primary-foreground transition hover:opacity-90 disabled:opacity-50"
            >
              <ShoppingBag className="h-4 w-4" />
              {added ? "Added ✓" : notInCountry ? "Unavailable in your region" : inStock ? "Add to bag" : "Sold out"}
            </button>
          </div>

          {product.description && (
            <div className="mt-12 border-t border-border pt-8">
              <h2 className="text-xs font-semibold uppercase tracking-widest text-foreground/70">
                Details
              </h2>
              <div
                className="prose prose-sm mt-4 max-w-none text-foreground/80"
                dangerouslySetInnerHTML={{ __html: product.description }}
              />
            </div>
          )}
        </div>
      </section>

      <ReviewsSection productId={product.id} />

      <SiteFooter />
    </div>
  );
}

function ReviewsSection({ productId }: { productId: number }) {
  const qc = useQueryClient();
  const fetchReviews = useServerFn(getProductReviews);
  const submitReview = useServerFn(createProductReview);
  const key = ["reviews", productId] as const;

  const { data: reviews = [], isLoading } = useQuery({
    queryKey: key,
    queryFn: () => fetchReviews({ data: { product_id: productId } }),
  });

  const [rating, setRating] = useState(5);
  const [hover, setHover] = useState(0);
  const [msg, setMsg] = useState<string | null>(null);

  const mutation = useMutation({
    mutationFn: (payload: { reviewer: string; reviewer_email: string; review: string }) =>
      submitReview({ data: { product_id: productId, rating, ...payload } }),
    onSuccess: () => {
      setMsg("Thanks! Your review was submitted and will appear after moderation.");
      qc.invalidateQueries({ queryKey: key });
    },
    onError: (e: Error) => setMsg(e.message),
  });

  const submit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setMsg(null);
    const f = new FormData(e.currentTarget);
    mutation.mutate({
      reviewer: String(f.get("reviewer") ?? ""),
      reviewer_email: String(f.get("reviewer_email") ?? ""),
      review: String(f.get("review") ?? ""),
    });
    (e.currentTarget as HTMLFormElement).reset();
    setRating(5);
  };

  const avg = reviews.length
    ? reviews.reduce((s, r) => s + r.rating, 0) / reviews.length
    : 0;

  return (
    <section className="mx-auto max-w-7xl border-t border-border px-4 py-16 md:px-8">
      <div className="grid gap-12 md:grid-cols-[1fr_1.2fr]">
        <div>
          <h2 className="font-display text-3xl md:text-4xl">Reviews</h2>
          {reviews.length > 0 && (
            <div className="mt-3 flex items-center gap-2">
              <Stars value={Math.round(avg)} />
              <span className="text-sm text-muted-foreground">
                {avg.toFixed(1)} · {reviews.length} review{reviews.length === 1 ? "" : "s"}
              </span>
            </div>
          )}

          <div className="mt-6 space-y-6">
            {isLoading && <p className="text-sm text-muted-foreground">Loading reviews…</p>}
            {!isLoading && reviews.length === 0 && (
              <p className="text-sm text-muted-foreground">No reviews yet. Be the first!</p>
            )}
            {reviews.map((r) => (
              <article key={r.id} className="border-b border-border/60 pb-6">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-medium">{r.reviewer}</p>
                  <span className="text-xs text-muted-foreground">
                    {new Date(r.date_created).toLocaleDateString()}
                  </span>
                </div>
                <Stars value={r.rating} />
                <div
                  className="prose prose-sm mt-2 max-w-none text-foreground/80"
                  dangerouslySetInnerHTML={{ __html: r.review }}
                />
              </article>
            ))}
          </div>
        </div>

        <form onSubmit={submit} className="h-fit rounded-2xl border border-border bg-card p-6">
          <h3 className="font-display text-2xl">Write a review</h3>

          <div className="mt-4">
            <label className="mb-1.5 block text-[11px] font-medium uppercase tracking-[0.18em] text-foreground/70">
              Your rating
            </label>
            <div className="flex gap-1" onMouseLeave={() => setHover(0)}>
              {[1, 2, 3, 4, 5].map((n) => (
                <button
                  key={n}
                  type="button"
                  onClick={() => setRating(n)}
                  onMouseEnter={() => setHover(n)}
                  aria-label={`${n} star`}
                >
                  <Star
                    className={
                      "h-6 w-6 " +
                      ((hover || rating) >= n
                        ? "fill-primary text-primary"
                        : "text-muted-foreground")
                    }
                  />
                </button>
              ))}
            </div>
          </div>

          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            <input
              name="reviewer"
              required
              placeholder="Name"
              className="w-full rounded-sm border border-border bg-white/70 px-3 py-2.5 text-sm focus:border-primary focus:outline-none"
            />
            <input
              name="reviewer_email"
              type="email"
              required
              placeholder="Email"
              className="w-full rounded-sm border border-border bg-white/70 px-3 py-2.5 text-sm focus:border-primary focus:outline-none"
            />
          </div>
          <textarea
            name="review"
            required
            rows={5}
            placeholder="Share your thoughts…"
            className="mt-4 w-full rounded-sm border border-border bg-white/70 px-3 py-2.5 text-sm focus:border-primary focus:outline-none"
          />
          {msg && <p className="mt-3 text-sm text-muted-foreground">{msg}</p>}
          <button
            type="submit"
            disabled={mutation.isPending}
            className="mt-4 w-full rounded-full bg-primary px-8 py-3 text-sm font-medium text-primary-foreground transition hover:opacity-90 disabled:opacity-60"
          >
            {mutation.isPending ? "Submitting…" : "Submit review"}
          </button>
          <p className="mt-2 text-[11px] text-muted-foreground">
            Reviews may be held for moderation before appearing.
          </p>
        </form>
      </div>
    </section>
  );
}

function Stars({ value }: { value: number }) {
  return (
    <div className="flex">
      {[1, 2, 3, 4, 5].map((n) => (
        <Star
          key={n}
          className={"h-4 w-4 " + (n <= value ? "fill-primary text-primary" : "text-muted-foreground")}
        />
      ))}
    </div>
  );
}

