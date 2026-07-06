import { createFileRoute, Link } from "@tanstack/react-router";
import { Package, DollarSign, ShoppingBag } from "lucide-react";

export const Route = createFileRoute("/admin/")({
  component: AdminHome,
});

function AdminHome() {
  return (
    <div>
      <h1 className="font-display text-3xl">Dashboard</h1>
      <p className="mt-2 text-sm text-muted-foreground">Manage per-country pricing and view orders.</p>

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

      <div className="mt-8 rounded-2xl border border-dashed border-border bg-card/50 p-6">
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
