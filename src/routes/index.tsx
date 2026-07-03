import { createFileRoute, Link } from "@tanstack/react-router";
import { queryOptions, useSuspenseQuery } from "@tanstack/react-query";
import { ArrowRight, Sparkles } from "lucide-react";
import { getProducts, getCategories, type WCProduct } from "@/lib/woocommerce.functions";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";

const HERO_IMG =
  "https://myheavenbeauty.com/wp-content/uploads/2026/04/IMG_2385.JPG-scaled.jpeg";

const productsQO = () =>
  queryOptions({
    queryKey: ["products", "all"],
    queryFn: () => getProducts({ data: { per_page: 24 } }),
  });
const catsQO = () =>
  queryOptions({
    queryKey: ["categories"],
    queryFn: () => getCategories(),
  });

export const Route = createFileRoute("/")({
  loader: ({ context }) => {
    context.queryClient.ensureQueryData(productsQO());
    context.queryClient.ensureQueryData(catsQO());
  },
  component: HomePage,
  errorComponent: ({ error, reset }) => (
    <div className="mx-auto max-w-xl p-10 text-center">
      <h2 className="font-display text-2xl">We couldn't load the store</h2>
      <p className="mt-2 text-sm text-muted-foreground">{error.message}</p>
      <button onClick={reset} className="mt-4 rounded-full bg-primary px-5 py-2 text-sm text-primary-foreground">
        Try again
      </button>
    </div>
  ),
});

function HomePage() {
  const { data: products } = useSuspenseQuery(productsQO());
  const { data: categories } = useSuspenseQuery(catsQO());

  return (
    <div className="min-h-screen">
      <SiteHeader />

      {/* Hero */}
      <section className="relative overflow-hidden bg-blush">
        <div className="mx-auto grid max-w-7xl items-center gap-12 px-4 py-16 md:grid-cols-2 md:px-8 md:py-24">
          <div>
            <span className="inline-flex items-center gap-2 rounded-full bg-white/70 px-4 py-1.5 text-xs font-medium uppercase tracking-widest text-primary">
              <Sparkles className="h-3.5 w-3.5" /> New Collection
            </span>
            <h1 className="mt-6 font-display text-5xl leading-[1.05] tracking-tight md:text-7xl">
              Effortless<br />Glow.
            </h1>
            <p className="mt-6 max-w-md text-lg text-muted-foreground">
              A touch of color designed to enhance your natural glow — soft,
              radiant, and effortlessly you.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link
                to="/shop"
                className="inline-flex items-center gap-2 rounded-full bg-primary px-7 py-3 text-sm font-medium text-primary-foreground shadow-sm transition hover:opacity-90"
              >
                Shop all <ArrowRight className="h-4 w-4" />
              </Link>
              <a
                href="#tints"
                className="inline-flex items-center rounded-full border border-foreground/20 px-7 py-3 text-sm font-medium text-foreground hover:bg-white/60"
              >
                Explore tints
              </a>
            </div>
          </div>
          <div className="relative">
            <div className="absolute -inset-4 rounded-[2.5rem] bg-white/40 blur-2xl" aria-hidden />
            <img
              src={HERO_IMG}
              alt="Heaven Beauty model with a soft pink glow"
              className="relative aspect-[4/5] w-full rounded-[2rem] object-cover shadow-xl"
            />
          </div>
        </div>
      </section>

      {/* Mission strip */}
      <section className="mx-auto max-w-6xl px-4 py-20 text-center md:px-8">
        <p className="mx-auto max-w-2xl font-display text-3xl leading-snug text-foreground md:text-4xl">
          Where <em className="text-primary not-italic">Tint</em> Meets Radiance
        </p>
        <p className="mx-auto mt-4 max-w-xl text-sm text-muted-foreground">
          Formulated with aloe, hyaluronic acid, and skin-loving pigments — for
          a finish that feels weightless and lasts all day.
        </p>
      </section>

      {/* Category grid */}
      <section id="tints" className="mx-auto max-w-7xl px-4 pb-8 md:px-8">
        <div className="grid gap-6 md:grid-cols-3">
          {categories.map((c) => {
            const cover = products.find((p) => p.categories.some((pc) => pc.id === c.id))?.images[0]?.src;
            return (
              <Link
                key={c.id}
                to="/shop"
                search={{ category: c.slug }}
                className="group relative overflow-hidden rounded-3xl bg-card"
              >
                {cover && (
                  <img
                    src={cover}
                    alt={c.name}
                    className="aspect-[4/5] w-full object-cover transition duration-700 group-hover:scale-105"
                  />
                )}
                <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/50 to-transparent p-6">
                  <h3 className="font-display text-2xl text-white">{c.name}</h3>
                  <span className="mt-1 inline-flex items-center gap-1 text-xs uppercase tracking-widest text-white/90">
                    Shop <ArrowRight className="h-3 w-3" />
                  </span>
                </div>
              </Link>
            );
          })}
        </div>
      </section>

      {/* Featured products */}
      <section className="mx-auto max-w-7xl px-4 py-20 md:px-8">
        <div className="mb-10 flex items-end justify-between">
          <h2 className="font-display text-4xl">Heavenly Tints</h2>
          <Link to="/shop" className="text-sm font-medium text-primary hover:underline">
            View all →
          </Link>
        </div>
        <div className="grid grid-cols-2 gap-6 md:grid-cols-3 lg:grid-cols-4">
          {products.slice(0, 8).map((p) => (
            <ProductCard key={p.id} product={p} />
          ))}
        </div>
      </section>

      <SiteFooter />
    </div>
  );
}

function ProductCard({ product }: { product: WCProduct }) {
  const img = product.images[0]?.src;
  return (
    <Link
      to="/shop/$slug"
      params={{ slug: product.slug }}
      className="group block"
    >
      <div className="aspect-square overflow-hidden rounded-2xl bg-blush/50">
        {img && (
          <img
            src={img}
            alt={product.name}
            className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
          />
        )}
      </div>
      <div className="mt-3 flex items-start justify-between gap-2">
        <h3 className="text-sm font-medium leading-snug text-foreground">
          {product.name}
        </h3>
        <span className="whitespace-nowrap text-sm font-semibold text-primary">
          ${Number(product.price).toFixed(2)}
        </span>
      </div>
    </Link>
  );
}
