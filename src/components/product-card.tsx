import { Link } from "@tanstack/react-router";
import type { MouseEvent } from "react";
import type { WCProduct } from "@/lib/woocommerce.functions";
import { addToCart } from "@/lib/cart";
import { useCountry } from "@/hooks/use-country";

export function ProductCard({ product }: { product: WCProduct }) {
  const img = product.images[0]?.src;
  const { pricing, format } = useCountry();
  const override = pricing.get(product.id);
  const displayPrice = override ? override.price : Number(product.price);
  const soldOut = override && !override.available;

  const handleAdd = (e: MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (soldOut) return;
    addToCart({
      id: product.id,
      slug: product.slug,
      name: product.name,
      price: String(displayPrice),
      image: img ?? "",
    });
  };

  return (
    <Link
      to="/shop/$slug"
      params={{ slug: product.slug }}
      className="group block bg-card p-5 shadow-sm transition duration-500 hover:shadow-lg"
    >
      <div className="relative aspect-square overflow-hidden bg-card">
        {img && (
          <img
            src={img}
            alt={product.name}
            className="h-full w-full object-contain transition duration-[900ms] ease-out group-hover:scale-[1.05]"
          />
        )}
        <button
          type="button"
          onClick={handleAdd}
          disabled={!!soldOut}
          className="absolute inset-x-0 bottom-0 translate-y-full bg-primary/85 py-4 text-center text-sm font-medium uppercase tracking-[0.14em] text-primary-foreground opacity-0 backdrop-blur-sm transition-all duration-300 ease-out group-hover:translate-y-0 group-hover:opacity-100 hover:bg-primary disabled:bg-muted disabled:text-muted-foreground"
        >
          {soldOut ? "Unavailable" : "Add to cart"}
        </button>
      </div>
      <div className="mt-4">
        <h3 className="text-sm text-foreground">{product.name}</h3>
        <p className="mt-1 text-xs text-muted-foreground">
          {soldOut ? "Not available in your region" : format(displayPrice)}
        </p>
      </div>
    </Link>
  );
}
