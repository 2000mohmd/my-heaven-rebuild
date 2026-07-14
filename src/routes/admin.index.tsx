import { createFileRoute, Link } from "@tanstack/react-router";
import { useMutation } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { useState } from "react";
import { Package, DollarSign, ShoppingBag, Download, Loader2, Check } from "lucide-react";
import { seedFromWoo } from "@/lib/seed-woo.functions";

export const Route = createFileRoute("/admin/")({
  component: AdminHome,
});

function AdminHome() {
  const runImport = useServerFn(seedFromWoo);
  const [result, setResult] = useState<{ categories: number; products: number; reviews: number } | null>(null);
  const [error, setError] = useState<string | null>(null);

  const mutation = useMutation({
    mutationFn: () => runImport(),
    onSuccess: (r) => {
      setResult({ categories: r.categories, products: r.products, reviews: r.reviews });
      setError(null);
    },
    onError: (e: Error) => setError(e.message),
  });

  return (
    <div>
      <h1 className="font-display text-3xl">Dashboard</h1>
      <p className="mt-2 text-sm text-muted-foreground">Manage your catalog, per-country pricing and orders.</p>

      <div className="mt-8 grid gap-4 md:grid-cols-2">
        <Link to="/admin/pricing" className="group rounded-2xl border border-border bg-card p-6 hover:border-primary hover:shadow-md transition">
          <DollarSign className="h-6 w-6 text-primary" />
          <h2 className="mt-3 font-display text-xl">Products & Pricing</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Set prices per country (Lebanon, UAE, Egypt, Jordan) and toggle availability.
          </p>
        </Link>
        <Link to="/admin/orders" className="group rounded-2xl border border-border bg-card p-6 hover:border-primary hover:shadow-md transition">
          <ShoppingBag className="h-6 w-6 text-primary" />
          <h2 className="mt-3 font-display text-xl">Orders</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            View recent orders from all countries.
          </p>
        </Link>
      </div>

      <div className="mt-8 rounded-2xl border-2 border-dashed border-primary/40 bg-primary/5 p-6">
        <div className="flex items-start gap-3">
          <Download className="mt-0.5 h-5 w-5 text-primary" />
          <div className="flex-1">
            <h3 className="font-display text-lg">Import from myheavenbeauty.com</h3>
            <p className="mt-1 text-sm text-muted-foreground">
              One-time import of all products, categories and approved reviews from your WooCommerce store into this native catalog.
              Safe to run multiple times — existing products (matched by slug) are updated in place.
            </p>
            <button
              onClick={() => mutation.mutate()}
              disabled={mutation.isPending}
              className="mt-4 inline-flex items-center gap-2 rounded-full bg-primary px-5 py-2 text-sm font-medium text-primary-foreground transition hover:opacity-90 disabled:opacity-60"
            >
              {mutation.isPending ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" /> Importing…
                </>
              ) : (
                <>
                  <Download className="h-4 w-4" /> Run import
                </>
              )}
            </button>
            {result && (
              <p className="mt-3 flex items-center gap-2 text-sm text-primary">
                <Check className="h-4 w-4" />
                Imported {result.categories} categories, {result.products} products, {result.reviews} reviews.
              </p>
            )}
            {error && <p className="mt-3 text-sm text-destructive">{error}</p>}
          </div>
        </div>
      </div>

      <div className="mt-6 rounded-2xl border border-dashed border-border bg-card/50 p-6">
        <div className="flex items-start gap-3">
          <Package className="mt-0.5 h-5 w-5 text-muted-foreground" />
          <div>
            <h3 className="text-sm font-medium">How it works</h3>
            <p className="mt-1 text-sm text-muted-foreground">
              Products without a price for a country are hidden from that country's shop.
              To make a product available in Lebanon, UAE, Egypt or Jordan, set its price
              in the Pricing page and enable the availability toggle.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
