import { Link } from "@tanstack/react-router";
import { ShoppingBag } from "lucide-react";
import { useCart, cartCount } from "@/lib/cart";

const LOGO_URL =
  "https://myheavenbeauty.com/wp-content/uploads/2021/10/Screenshot__262_-removebg-preview-e1773776786591.png";

export function SiteHeader() {
  const items = useCart();
  const count = cartCount(items);

  return (
    <header className="sticky top-0 z-40 border-b border-border/60 bg-background/80 backdrop-blur">
      <div className="mx-auto flex h-20 max-w-7xl items-center justify-between px-4 md:px-8">
        <nav className="flex items-center gap-6 text-sm font-medium tracking-wide uppercase text-foreground/80">
          <Link to="/shop" className="hover:text-primary transition-colors">
            Shop
          </Link>
          <Link to="/" className="hover:text-primary transition-colors">
            Home
          </Link>
        </nav>

        <Link to="/" className="absolute left-1/2 -translate-x-1/2">
          <img src={LOGO_URL} alt="Heaven Beauty" className="h-12 w-auto md:h-14" />
        </Link>

        <div className="flex items-center gap-5">
          <Link
            to="/cart"
            className="relative flex items-center gap-2 text-sm font-medium text-foreground/80 hover:text-primary transition-colors"
            aria-label="Cart"
          >
            <ShoppingBag className="h-5 w-5" />
            <span className="hidden sm:inline">Cart</span>
            <span className="absolute -top-2 -right-3 flex h-5 min-w-5 items-center justify-center rounded-full bg-primary px-1 text-[11px] font-semibold text-primary-foreground">
              {count}
            </span>
          </Link>
        </div>
      </div>
    </header>
  );
}
