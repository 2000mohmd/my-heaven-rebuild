import { createFileRoute, Link } from "@tanstack/react-router";
import { queryOptions, useSuspenseQuery } from "@tanstack/react-query";
import { z } from "zod";
import { getProducts, getCategories } from "@/lib/woocommerce.functions";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { ProductCard } from "@/components/product-card";
import { useCountry } from "@/hooks/use-country";

const searchSchema = z.object({
  category: z.string().optional(),
});

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

export const Route = createFileRoute("/shop/")({
  validateSearch: searchSchema,
  loader: ({ context }) => {
    context.queryClient.ensureQueryData(productsQO());
    context.queryClient.ensureQueryData(catsQO());
  },
  head: () => ({
    meta: [
      { title: "Shop All — Heaven Beauty" },
      { name: "description", content: "Browse our full collection of Heavenly Tints, Sparkly Tints and Devotion blushes." },
      { property: "og:title", content: "Shop All — Heaven Beauty" },
      { property: "og:description", content: "Browse our full collection of tints and blushes." },
    ],
  }),
  component: ShopPage,
  errorComponent: ({ error, reset }) => (
    <div className="mx-auto max-w-xl p-10 text-center">
      <h2 className="font-display text-2xl">Couldn't load products</h2>
      <p className="mt-2 text-sm text-muted-foreground">{error.message}</p>
      <button onClick={reset} className="mt-4 rounded-full bg-primary px-5 py-2 text-sm text-primary-foreground">Retry</button>
    </div>
  ),
});

function ShopPage() {
  const { category } = Route.useSearch();
  const { data: products } = useSuspenseQuery(productsQO());
  const { data: categories } = useSuspenseQuery(catsQO());
  const { pricing } = useCountry();

  const available = products.filter((p) => pricing.has(p.id));
  const filtered = category
    ? available.filter((p) => p.categories.some((c) => c.slug === category))
    : available;

  return (
    <div className="min-h-screen">
      <SiteHeader />

      <section className="border-b border-border/60 bg-blush/40 pt-16 md:pt-20">
        <div className="mx-auto max-w-7xl px-4 py-14 md:px-8">
          <h1 className="font-display text-5xl">Shop</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            {filtered.length} product{filtered.length === 1 ? "" : "s"}
          </p>
          <div className="mt-6 flex flex-wrap gap-2">
            <FilterChip active={!category} to="/shop" search={{}} label="All" />
            {categories.map((c) => (
              <FilterChip
                key={c.id}
                active={category === c.slug}
                to="/shop"
                search={{ category: c.slug }}
                label={c.name}
              />
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-14 md:px-8">
        {filtered.length === 0 ? (
          <p className="py-20 text-center text-muted-foreground">No products in this category yet.</p>
        ) : (
          <div className="grid grid-cols-2 gap-x-6 gap-y-10 md:grid-cols-3 lg:grid-cols-4">
            {filtered.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        )}
      </section>

      <SiteFooter />
    </div>
  );
}

function FilterChip({
  active,
  to,
  search,
  label,
}: {
  active: boolean;
  to: string;
  search: { category?: string };
  label: string;
}) {
  return (
    <Link
      to={to as "/shop"}
      search={search}
      className={
        "rounded-full border px-4 py-1.5 text-sm transition " +
        (active
          ? "border-primary bg-primary text-primary-foreground"
          : "border-border bg-white/60 text-foreground hover:border-primary/50")
      }
    >
      {label}
    </Link>
  );
}

