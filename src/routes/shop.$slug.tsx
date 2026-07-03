import { createFileRoute, Link, notFound, useRouter } from "@tanstack/react-router";
import { queryOptions, useSuspenseQuery } from "@tanstack/react-query";
import { useState } from "react";
import { Minus, Plus, ShoppingBag, ArrowLeft } from "lucide-react";
import { getProductBySlug } from "@/lib/woocommerce.functions";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { addToCart } from "@/lib/cart";

const productQO = (slug: string) =>
  queryOptions({
    queryKey: ["product", slug],
    queryFn: () => getProductBySlug({ data: { slug } }),
  });

export const Route = createFileRoute("/shop/$slug")({
  loader: async ({ context, params }) => {
    const product = await context.queryClient.ensureQueryData(productQO(params.slug));
    if (!product) throw notFound();
  },
  head: ({ loaderData, params }) => {
    const title = params?.slug
      ? `${params.slug.replace(/-/g, " ")} — Heaven Beauty`
      : "Product — Heaven Beauty";
    return {
      meta: [
        { title },
        { name: "description", content: "Shop this Heaven Beauty product." },
        { property: "og:title", content: title },
      ],
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
  const [qty, setQty] = useState(1);
  const [imgIdx, setImgIdx] = useState(0);
  const [added, setAdded] = useState(false);

  if (!product) return null;
  const price = Number(product.price);
  const inStock = product.stock_status === "instock";

  const handleAdd = () => {
    addToCart(
      {
        id: product.id,
        slug: product.slug,
        name: product.name,
        price: product.price,
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

      <div className="mx-auto max-w-7xl px-4 py-8 md:px-8">
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
          <p className="mt-4 text-3xl font-semibold text-primary">${price.toFixed(2)}</p>

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
              {added ? "Added ✓" : inStock ? "Add to bag" : "Sold out"}
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

      <SiteFooter />
    </div>
  );
}
