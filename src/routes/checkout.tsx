import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState, type FormEvent } from "react";
import { useMutation } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { useCart, cartTotal, clearCart } from "@/lib/cart";
import { createOrder } from "@/lib/woocommerce.functions";

export const Route = createFileRoute("/checkout")({
  head: () => ({
    meta: [
      { title: "Checkout — Heaven Beauty" },
      { name: "description", content: "Complete your Heaven Beauty order." },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: CheckoutPage,
});

type OrderResult = { id: number; number: string; total: string };

function CheckoutPage() {
  const items = useCart();
  const total = cartTotal(items);
  const navigate = useNavigate();
  const createOrderFn = useServerFn(createOrder);
  const [placed, setPlaced] = useState<OrderResult | null>(null);

  const mutation = useMutation({
    mutationFn: (payload: Parameters<typeof createOrder>[0]["data"]) =>
      createOrderFn({ data: payload }),
    onSuccess: (order) => {
      setPlaced(order);
      clearCart();
    },
  });

  const submit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const f = new FormData(e.currentTarget);
    mutation.mutate({
      billing: {
        first_name: String(f.get("first_name") ?? ""),
        last_name: String(f.get("last_name") ?? ""),
        address_1: String(f.get("address_1") ?? ""),
        city: String(f.get("city") ?? ""),
        postcode: String(f.get("postcode") ?? ""),
        country: String(f.get("country") ?? "LB"),
        email: String(f.get("email") ?? ""),
        phone: String(f.get("phone") ?? ""),
      },
      line_items: items.map((it) => ({ product_id: it.id, quantity: it.quantity })),
    });
  };

  if (placed) {
    return (
      <div className="min-h-screen bg-background">
        <SiteHeader />
        <section className="mx-auto max-w-xl px-6 py-24 text-center">
          <h1 className="text-primary text-4xl md:text-5xl" style={{ fontFamily: "var(--font-mattone)", fontWeight: 300 }}>
            Thank you
          </h1>
          <p className="mt-4 text-sm text-muted-foreground">
            Your order <span className="font-semibold text-foreground">#{placed.number}</span> has been received. We'll be in touch shortly to confirm delivery.
          </p>
          <button
            onClick={() => navigate({ to: "/shop" })}
            className="mt-8 rounded-sm border border-primary bg-primary px-8 py-2.5 text-[11px] font-medium uppercase tracking-[0.22em] text-primary-foreground hover:bg-transparent hover:text-primary"
          >
            Continue shopping
          </button>
        </section>
        <SiteFooter />
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="min-h-screen bg-background">
        <SiteHeader />
        <section className="mx-auto max-w-xl px-6 py-24 text-center">
          <h1 className="text-primary text-3xl" style={{ fontFamily: "var(--font-mattone)", fontWeight: 300 }}>
            Your bag is empty
          </h1>
          <Link to="/shop" className="mt-6 inline-block text-xs uppercase tracking-[0.28em] text-primary underline underline-offset-[6px]">
            Shop now
          </Link>
        </section>
        <SiteFooter />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <SiteHeader />
      <section className="mx-auto grid max-w-6xl gap-12 px-6 py-16 md:grid-cols-[1fr_380px] md:px-8">
        <div>
          <h1 className="text-primary text-3xl md:text-4xl" style={{ fontFamily: "var(--font-mattone)", fontWeight: 300 }}>
            Checkout
          </h1>

          <form onSubmit={submit} className="mt-8 space-y-5">
            <div className="grid grid-cols-2 gap-4">
              <Field name="first_name" label="First name" required />
              <Field name="last_name" label="Last name" required />
            </div>
            <Field name="email" label="Email" type="email" required />
            <Field name="phone" label="Phone" type="tel" required />
            <Field name="address_1" label="Address" required />
            <div className="grid grid-cols-2 gap-4">
              <Field name="city" label="City" required />
              <Field name="postcode" label="Postal code" />
            </div>
            <div>
              <label className="mb-1.5 block text-[11px] font-medium uppercase tracking-[0.18em] text-foreground/70">Country</label>
              <select
                name="country"
                defaultValue="LB"
                className="w-full rounded-sm border border-border bg-white/70 px-3 py-2.5 text-sm focus:border-primary focus:outline-none"
              >
                <option value="LB">Lebanon</option>
                <option value="AE">United Arab Emirates</option>
                <option value="SA">Saudi Arabia</option>
                <option value="KW">Kuwait</option>
                <option value="QA">Qatar</option>
                <option value="US">United States</option>
                <option value="GB">United Kingdom</option>
              </select>
            </div>

            <div className="rounded-sm border border-border bg-white/60 p-4 text-sm text-foreground/80">
              <p className="font-medium text-foreground">Cash on delivery</p>
              <p className="mt-1 text-xs text-muted-foreground">
                Pay when your order arrives. We'll confirm by phone before dispatch.
              </p>
            </div>

            {mutation.error && (
              <p className="text-sm text-destructive">
                {(mutation.error as Error).message}
              </p>
            )}

            <button
              type="submit"
              disabled={mutation.isPending}
              className="w-full rounded-sm border border-primary bg-primary px-8 py-3.5 text-[11px] font-medium uppercase tracking-[0.22em] text-primary-foreground transition hover:bg-transparent hover:text-primary disabled:opacity-60"
            >
              {mutation.isPending ? "Placing order…" : `Place order — $${total.toFixed(2)}`}
            </button>
          </form>
        </div>

        <aside className="h-fit border border-border bg-card p-6">
          <h2 className="text-primary text-lg" style={{ fontFamily: "var(--font-mattone)", fontWeight: 300 }}>
            Your bag
          </h2>
          <ul className="mt-4 divide-y divide-border/60 text-sm">
            {items.map((it) => (
              <li key={it.id} className="flex items-center gap-3 py-3">
                {it.image && <img src={it.image} alt="" className="h-14 w-14 rounded-sm object-cover" />}
                <div className="flex-1">
                  <p className="text-foreground">{it.name}</p>
                  <p className="text-xs text-muted-foreground">Qty {it.quantity}</p>
                </div>
                <span className="text-sm">${(Number(it.price) * it.quantity).toFixed(2)}</span>
              </li>
            ))}
          </ul>
          <div className="mt-4 flex justify-between border-t border-border pt-4 text-base font-semibold">
            <span>Total</span>
            <span>${total.toFixed(2)}</span>
          </div>
        </aside>
      </section>
      <SiteFooter />
    </div>
  );
}

function Field({
  name,
  label,
  type = "text",
  required,
}: {
  name: string;
  label: string;
  type?: string;
  required?: boolean;
}) {
  return (
    <div>
      <label className="mb-1.5 block text-[11px] font-medium uppercase tracking-[0.18em] text-foreground/70">
        {label}{required && <span className="text-primary"> *</span>}
      </label>
      <input
        name={name}
        type={type}
        required={required}
        className="w-full rounded-sm border border-border bg-white/70 px-3 py-2.5 text-sm focus:border-primary focus:outline-none"
      />
    </div>
  );
}
