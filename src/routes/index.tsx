import { createFileRoute, Link } from "@tanstack/react-router";
import { queryOptions, useSuspenseQuery } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { ArrowRight } from "lucide-react";
import { getProducts, getCategories, type WCProduct } from "@/lib/woocommerce.functions";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";

// Slides from Elementor export (elementor-988624)
const SLIDES = [
  {
    img: "https://myheavenbeauty.com/wp-content/uploads/2026/04/IMG_2385.JPG-scaled.jpeg",
    caption: "Effortless Glow",
    cta: { label: "Shop All", to: "/shop" as const },
  },
  {
    img: "https://myheavenbeauty.com/wp-content/uploads/2026/04/IMG_2386.JPG-scaled.jpeg",
    caption: "",
    cta: null,
  },
  {
    img: "https://myheavenbeauty.com/wp-content/uploads/2026/06/IMG_5185.JPG-1-1-1-1-1-1-1-scaled.webp",
    caption: "",
    cta: null,
  },
];

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
      <HeroSlider />
      <WelcomeSection />

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
          <h2 style={{ fontFamily: "var(--font-mattone)" }} className="text-4xl">
            Heavenly Tints
          </h2>
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

/** Full-width auto-rotating slider — matches Elementor slides widget (550px, 2s autoplay). */
function HeroSlider() {
  const [i, setI] = useState(0);
  useEffect(() => {
    const t = setInterval(() => setI((v) => (v + 1) % SLIDES.length), 5000);
    return () => clearInterval(t);
  }, []);

  return (
    <section className="relative w-full overflow-hidden" style={{ height: "min(80vh, 640px)" }}>
      {SLIDES.map((s, idx) => (
        <div
          key={idx}
          className="absolute inset-0 transition-opacity duration-1000 ease-in-out"
          style={{ opacity: i === idx ? 1 : 0 }}
          aria-hidden={i !== idx}
        >
          <img src={s.img} alt="" className="h-full w-full object-cover" />
          <div className="absolute inset-0 bg-black/15" />
          {s.caption && (
            <div className="absolute inset-0 flex items-center">
              <div className="mx-auto flex w-full max-w-7xl flex-col items-start px-6 md:px-16">
                <p
                  style={{ fontFamily: "var(--font-mattone)", fontWeight: 300 }}
                  className="text-white drop-shadow-sm text-[35px] leading-[1.05] md:text-[51px]"
                >
                  {s.caption}
                </p>
                {s.cta && (
                  <Link
                    to={s.cta.to}
                    className="mt-6 inline-flex items-center gap-2 rounded-none border border-white bg-transparent px-6 py-2.5 text-xs font-medium uppercase tracking-[0.2em] text-white transition hover:bg-white hover:text-foreground"
                  >
                    {s.cta.label}
                  </Link>
                )}
              </div>
            </div>
          )}
        </div>
      ))}

      {/* Dots */}
      <div className="absolute bottom-6 left-1/2 z-10 flex -translate-x-1/2 gap-2">
        {SLIDES.map((_, idx) => (
          <button
            key={idx}
            onClick={() => setI(idx)}
            aria-label={`Slide ${idx + 1}`}
            className={
              "h-1.5 rounded-full transition-all " +
              (i === idx ? "w-8 bg-white" : "w-1.5 bg-white/60")
            }
          />
        ))}
      </div>
    </section>
  );
}

/** "Welcome To Heaven Beauty" — matches elementor-988603 intro section. */
function WelcomeSection() {
  return (
    <section className="mx-auto max-w-6xl px-6 py-24 md:px-8 md:py-32">
      <div className="max-w-2xl">
        <p
          style={{ fontFamily: "var(--font-mattone)", fontWeight: 300 }}
          className="text-right text-2xl text-foreground/70 md:text-3xl"
        >
          Welcome To
        </p>
        <h1
          style={{ fontFamily: "var(--font-mattone)", fontWeight: 400 }}
          className="mt-2 text-left text-6xl leading-[1] text-foreground md:text-8xl"
        >
          Heaven Beauty
        </h1>
        <p className="mt-8 max-w-lg text-base leading-relaxed text-muted-foreground md:text-lg">
          A touch of color designed to enhance your natural glow — soft,
          radiant, and effortlessly you. Formulated with aloe, hyaluronic acid,
          and skin-loving pigments.
        </p>
        <Link
          to="/shop"
          className="mt-8 inline-flex items-center gap-2 text-sm font-medium uppercase tracking-[0.2em] text-primary hover:gap-3 transition-all"
        >
          Discover the collection <ArrowRight className="h-4 w-4" />
        </Link>
      </div>
    </section>
  );
}

function ProductCard({ product }: { product: WCProduct }) {
  const img = product.images[0]?.src;
  return (
    <Link to="/shop/$slug" params={{ slug: product.slug }} className="group block">
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
