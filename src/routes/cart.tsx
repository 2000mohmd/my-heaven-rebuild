import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { Minus, Plus, Trash2, ShoppingBag } from "lucide-react";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { useCart, updateQty, removeFromCart, cartTotal, clearCart } from "@/lib/cart";
import { useCountry } from "@/hooks/use-country";

export const Route = createFileRoute("/cart")({
  head: () => ({
    meta: [
      { title: "Your Bag — Heaven Beauty" },
      { name: "description", content: "Review the tints, blushes, and beauty essentials in your Heaven Beauty bag before checking out." },
      { property: "og:title", content: "Your Bag — Heaven Beauty" },
      { property: "og:description", content: "Review the tints, blushes, and beauty essentials in your Heaven Beauty bag before checking out." },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: CartPage,
});

function CartPage() {
  const items = useCart();
  const total = cartTotal(items);
  const navigate = useNavigate();
  const { format } = useCountry();

  const handleCheckout = () => {
    navigate({ to: "/checkout" });
  };


  return (
    <div className="min-h-screen">
      <SiteHeader />

      <section className="mx-auto max-w-5xl px-4 pt-24 pb-14 md:px-8 md:pt-32">
        <h1 className="font-display text-4xl md:text-5xl">Your bag</h1>

        {items.length === 0 ? (
          <div className="mt-16 rounded-3xl bg-blush/40 py-20 text-center">
            <ShoppingBag className="mx-auto h-10 w-10 text-primary" />
            <p className="mt-4 font-display text-2xl">Your bag is empty</p>
            <p className="mt-2 text-sm text-muted-foreground">
              Discover our tints and add a little glow.
            </p>
            <Link
              to="/shop"
              className="mt-6 inline-block rounded-full bg-primary px-6 py-3 text-sm font-medium text-primary-foreground"
            >
              Shop now
            </Link>
          </div>
        ) : (
          <div className="mt-10 grid gap-10 lg:grid-cols-[1fr_360px]">
            <ul className="divide-y divide-border">
              {items.map((it) => (
                <li key={it.id} className="flex gap-4 py-6">
                  <Link
                    to="/shop/$slug"
                    params={{ slug: it.slug }}
                    className="h-24 w-24 shrink-0 overflow-hidden rounded-xl bg-blush/50"
                  >
                    {it.image && <img src={it.image} alt={it.name} className="h-full w-full object-cover" />}
                  </Link>
                  <div className="flex flex-1 flex-col justify-between">
                    <div className="flex items-start justify-between">
                      <Link to="/shop/$slug" params={{ slug: it.slug }} className="text-sm font-medium hover:text-primary">
                        {it.name}
                      </Link>
                      <button onClick={() => removeFromCart(it.id)} className="text-muted-foreground hover:text-destructive" aria-label="Remove">
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center rounded-full border border-border">
                        <button onClick={() => updateQty(it.id, it.quantity - 1)} className="px-3 py-2 text-muted-foreground hover:text-foreground" aria-label="Decrease">
                          <Minus className="h-3.5 w-3.5" />
                        </button>
                        <span className="w-7 text-center text-sm">{it.quantity}</span>
                        <button onClick={() => updateQty(it.id, it.quantity + 1)} className="px-3 py-2 text-muted-foreground hover:text-foreground" aria-label="Increase">
                          <Plus className="h-3.5 w-3.5" />
                        </button>
                      </div>
                      <span className="text-sm font-semibold">
                        {format(Number(it.price) * it.quantity)}
                      </span>
                    </div>
                  </div>
                </li>
              ))}
            </ul>

            <aside className="h-fit rounded-3xl border border-border bg-card p-6">
              <h2 className="font-display text-xl">Summary</h2>
              <div className="mt-4 space-y-2 text-sm">
                <div className="flex justify-between text-muted-foreground">
                  <span>Subtotal</span>
                  <span>{format(total)}</span>
                </div>
                <div className="flex justify-between text-muted-foreground">
                  <span>Shipping</span>
                  <span>Calculated at checkout</span>
                </div>
                <div className="mt-4 flex justify-between border-t border-border pt-4 text-base font-semibold">
                  <span>Total</span>
                  <span>{format(total)}</span>
                </div>
              </div>
              <button
                onClick={handleCheckout}
                className="mt-6 w-full rounded-full bg-primary py-3.5 text-sm font-medium text-primary-foreground transition hover:opacity-90"
              >
                Checkout on myheavenbeauty.com
              </button>
              <p className="mt-3 text-center text-[11px] text-muted-foreground">
                You'll complete payment securely on our WooCommerce store.
              </p>
              <button
                onClick={() => clearCart()}
                className="mt-4 w-full text-center text-xs text-muted-foreground hover:text-destructive"
              >
                Clear bag
              </button>
            </aside>
          </div>
        )}
      </section>

      <SiteFooter />
    </div>
  );
}
