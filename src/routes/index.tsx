import { createFileRoute, Link } from "@tanstack/react-router";
import { queryOptions, useSuspenseQuery } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { getProducts, getCategories, type WCProduct, type WCCategory } from "@/lib/woocommerce.functions";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import pureModelAsset from "@/assets/pure-model.jpg.asset.json";
import storyModelAsset from "@/assets/story-model.jpg.asset.json";
import differenceModelAsset from "@/assets/difference-model.jpg.asset.json";

/* Slides — from Elementor export */
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

/* Section images — uploaded to CDN */
const IMG_PURE_MODEL = pureModelAsset.url;
const IMG_STORY_MODEL = storyModelAsset.url;
const IMG_DIFFERENCE_MODEL = differenceModelAsset.url;
const IMG_GLOW_INLINE = storyModelAsset.url;

const productsQO = () =>
  queryOptions({
    queryKey: ["products", "all"],
    queryFn: () => getProducts({ data: { per_page: 48 } }),
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

  // Preserve the order shown on the live site: Heavenly Tints → Sparkly Tints → Devotion
  const order = ["heavenly-tints", "sparkly-tints", "devotion"];
  const orderedCats = [...categories].sort(
    (a, b) => order.indexOf(a.slug) - order.indexOf(b.slug),
  );

  return (
    <div className="min-h-screen bg-background">
      <SiteHeader transparent />
      <HeroSlider />
      <WhereTintSection />

      {/* Category rows */}
      <div className="pb-4">
        {orderedCats.map((c) => (
          <CategoryRow key={c.id} category={c} products={products} />
        ))}
      </div>

      <GlowLineSection />
      <FirstOfItsKindSection />
      <OurStorySection />
      <OurDifferenceSection />

      <SiteFooter />
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Hero slider — full-bleed, autoplay, "Effortless Glow" on slide 1  */
/* ------------------------------------------------------------------ */
function HeroSlider() {
  const [i, setI] = useState(0);
  useEffect(() => {
    const t = setInterval(() => setI((v) => (v + 1) % SLIDES.length), 5000);
    return () => clearInterval(t);
  }, []);

  return (
    <section className="relative w-full overflow-hidden" style={{ height: "min(92vh, 720px)" }}>
      {SLIDES.map((s, idx) => (
        <div
          key={idx}
          className="absolute inset-0 transition-opacity duration-1000 ease-in-out"
          style={{ opacity: i === idx ? 1 : 0 }}
          aria-hidden={i !== idx}
        >
          <img src={s.img} alt="" className="h-full w-full object-cover" />
          <div className="absolute inset-0 bg-black/10" />
          {s.caption && (
            <div className="absolute inset-0 flex items-center">
              <div className="mx-auto flex w-full max-w-7xl flex-col items-start px-6 md:px-14">
                <h1
                  className="text-white drop-shadow-sm"
                  style={{
                    fontFamily: "var(--font-mattone)",
                    fontWeight: 300,
                    fontSize: "clamp(2rem, 5vw, 3.2rem)",
                    lineHeight: 1.05,
                    letterSpacing: "0.01em",
                  }}
                >
                  {s.caption}
                </h1>
                {s.cta && (
                  <Link
                    to={s.cta.to}
                    className="mt-5 inline-flex items-center rounded-sm border border-white/90 bg-transparent px-5 py-2 text-[11px] font-medium uppercase tracking-[0.22em] text-white transition hover:bg-white hover:text-foreground"
                  >
                    {s.cta.label}
                  </Link>
                )}
              </div>
            </div>
          )}
        </div>
      ))}

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

/* ------------------------------------------------------------------ */
/* "Where Tint Meets Radiance" — two-column intro                     */
/* ------------------------------------------------------------------ */
function WhereTintSection() {
  return (
    <section className="mx-auto max-w-6xl px-6 pt-16 pb-4 md:px-8 md:pt-24 md:pb-8">
      <div className="grid gap-8 md:grid-cols-2 md:gap-16">
        <h2
          className="text-primary text-3xl leading-[1.05] md:text-5xl"
          style={{ fontFamily: "var(--font-mattone)", fontWeight: 300 }}
        >
          Where Tint Meets Radiance
        </h2>
        <div className="max-w-md text-sm leading-relaxed text-muted-foreground md:pt-3">
          <p>
            A touch of color designed to enhance your natural glow — soft,
            radiant, and effortlessly you.
          </p>
          <Link
            to="/shop"
            className="mt-4 inline-block text-primary underline underline-offset-4 hover:opacity-70"
          >
            Our Story
          </Link>
        </div>
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------ */
/* Category row — heading centered, products beneath                  */
/* ------------------------------------------------------------------ */
function CategoryRow({ category, products }: { category: WCCategory; products: WCProduct[] }) {
  const items = products.filter((p) => p.categories.some((c) => c.id === category.id));
  if (items.length === 0) return null;

  return (
    <section className="mx-auto max-w-6xl px-6 py-8 md:px-8 md:py-10">
      <h2
        className="mb-8 text-center text-primary text-3xl md:mb-10 md:text-4xl"
        style={{ fontFamily: "var(--font-mattone)", fontWeight: 300 }}
      >
        {category.name}
      </h2>
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-3">
        {items.slice(0, 3).map((p) => (
          <ProductCard key={p.id} product={p} />
        ))}
      </div>
    </section>
  );
}

function ProductCard({ product }: { product: WCProduct }) {
  const img = product.images[0]?.src;
  return (
    <Link
      to="/shop/$slug"
      params={{ slug: product.slug }}
      className="group block bg-card p-5 shadow-sm transition hover:shadow-md"
    >
      <div className="aspect-square overflow-hidden bg-card">
        {img && (
          <img
            src={img}
            alt={product.name}
            className="h-full w-full object-contain transition duration-500 group-hover:scale-[1.03]"
          />
        )}
      </div>
      <div className="mt-4">
        <h3 className="text-sm text-foreground">{product.name}</h3>
        <p className="mt-1 text-xs text-muted-foreground">
          ${Number(product.price).toFixed(2)}
        </p>
      </div>
    </Link>
  );
}

/* ------------------------------------------------------------------ */
/* "Your glow speaks for itself we simply enhance it"                 */
/* ------------------------------------------------------------------ */
function GlowLineSection() {
  return (
    <section className="mx-auto max-w-6xl px-6 py-20 md:px-8 md:py-32">
      <h2
        className="text-primary text-3xl leading-[1.15] md:text-5xl"
        style={{ fontFamily: "var(--font-mattone)", fontWeight: 300 }}
      >
        Your glow speaks{" "}
        <span className="relative inline-block align-middle">
          <img
            src={IMG_GLOW_INLINE}
            alt=""
            className="inline-block h-12 w-16 rotate-[8deg] object-cover align-middle md:h-24 md:w-32"
          />
        </span>{" "}
        for itself we simply enhance it
      </h2>
    </section>
  );
}

/* ------------------------------------------------------------------ */
/* "The first of it's kind" — starry blue split                       */
/* ------------------------------------------------------------------ */
function FirstOfItsKindSection() {
  return (
    <section className="mx-auto max-w-7xl px-4 py-10 md:px-8 md:py-16">
      <div
        className="relative grid overflow-hidden md:grid-cols-2"
        style={{
          background:
            "radial-gradient(ellipse at top right, oklch(0.85 0.05 245) 0%, var(--starry) 60%, oklch(0.7 0.08 250) 100%)",
        }}
      >
        {/* Starry sparkles */}
        <div className="pointer-events-none absolute inset-0 opacity-70"
             style={{
               backgroundImage:
                 "radial-gradient(1.5px 1.5px at 20% 30%, white, transparent), radial-gradient(1px 1px at 70% 20%, white, transparent), radial-gradient(1.5px 1.5px at 40% 60%, white, transparent), radial-gradient(1px 1px at 85% 75%, white, transparent), radial-gradient(1.2px 1.2px at 15% 80%, white, transparent), radial-gradient(1px 1px at 60% 45%, white, transparent)",
               backgroundSize: "600px 600px",
             }}
        />
        <div className="relative">
          <img
            src={IMG_PURE_MODEL}
            alt="Model with Heaven Beauty PURE"
            className="h-full max-h-[560px] w-full object-cover object-center"
          />
        </div>
        <div className="relative flex flex-col justify-center px-8 py-14 md:px-14 md:py-20">
          <h2
            className="text-white text-3xl md:text-5xl"
            style={{ fontFamily: "var(--font-mattone)", fontWeight: 300 }}
          >
            The first of it&rsquo;s kind
          </h2>
          <p className="mt-3 text-sm uppercase tracking-[0.2em] text-white/90">
            Introducing <span className="font-semibold">PURE</span>
          </p>
          <p className="mt-5 max-w-md text-sm leading-relaxed text-white/90">
            A soft, light pink created to enhance your natural beauty, blending
            seamlessly into your skin for a fresh, radiant glow that feels
            effortless and true to you.
          </p>
          <Link
            to="/shop"
            className="mt-8 inline-flex w-fit items-center rounded-sm bg-primary px-6 py-2.5 text-[11px] font-medium uppercase tracking-[0.22em] text-primary-foreground hover:opacity-90"
          >
            Shop
          </Link>
        </div>
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------ */
/* Our Story — image left, blush block right                          */
/* ------------------------------------------------------------------ */
function OurStorySection() {
  return (
    <section className="mx-auto max-w-7xl px-4 pt-6 md:px-8">
      <div className="grid overflow-hidden md:grid-cols-2">
        <img
          src={IMG_STORY_MODEL}
          alt="Heaven Beauty story"
          className="h-full max-h-[520px] w-full object-cover"
        />
        <div className="flex flex-col items-center justify-center bg-blush px-8 py-14 text-center md:px-14 md:py-20">
          <h2
            className="text-primary text-3xl md:text-4xl"
            style={{ fontFamily: "var(--font-mattone)", fontWeight: 300 }}
          >
            Our Story
          </h2>
          <p className="mt-6 max-w-sm text-sm leading-relaxed text-foreground/80">
            Heaven Beauty was created to redefine beauty as something effortless.
            Intentional and true to you. My honest products that enhance your
            natural features, not hide them.
          </p>
          <Link
            to="/shop"
            className="mt-8 text-xs uppercase tracking-[0.22em] text-primary underline underline-offset-4 hover:opacity-70"
          >
            Read our story
          </Link>
        </div>
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------ */
/* Our Difference — cream block left, image right                     */
/* ------------------------------------------------------------------ */
function OurDifferenceSection() {
  return (
    <section className="mx-auto max-w-7xl px-4 py-6 pb-20 md:px-8 md:pb-28">
      <div className="grid overflow-hidden md:grid-cols-2">
        <div className="flex flex-col items-center justify-center bg-cream px-8 py-14 text-center md:px-14 md:py-20">
          <h2
            className="text-primary text-3xl md:text-4xl"
            style={{ fontFamily: "var(--font-mattone)", fontWeight: 300 }}
          >
            Our Difference
          </h2>
          <p className="mt-6 max-w-sm text-sm leading-relaxed text-foreground/80">
            Designed with good intention, made to feel like nothing on your skin.
            Our long-lasting, blendable tints adapt to every tone, leaving a
            soft, radiant glow — gentle even for sensitive skin.
          </p>
        </div>
        <img
          src={IMG_DIFFERENCE_MODEL}
          alt="Heaven Beauty difference"
          className="h-full max-h-[520px] w-full object-cover"
        />
      </div>
    </section>
  );
}
