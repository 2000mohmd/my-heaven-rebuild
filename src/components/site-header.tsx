import { Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { ShoppingBag, Menu, X } from "lucide-react";
import { useCart, cartCount } from "@/lib/cart";
import { CountrySwitcher } from "@/components/country-switcher";

const LOGO_URL =
  "https://myheavenbeauty.com/wp-content/uploads/2021/10/Screenshot__262_-removebg-preview-e1773776786591.png";

export function SiteHeader({ transparent = false }: { transparent?: boolean }) {
  const items = useCart();
  const count = cartCount(items);
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    if (!transparent) return;
    const onScroll = () => setScrolled(window.scrollY > 40);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, [transparent]);

  useEffect(() => {
    if (menuOpen) {
      document.body.style.overflow = "hidden";
      return () => {
        document.body.style.overflow = "";
      };
    }
  }, [menuOpen]);

  const overlay = transparent && !scrolled && !menuOpen;

  return (
    <header
      className={
        "fixed top-0 left-0 right-0 z-40 transition-colors duration-300 " +
        (overlay
          ? "bg-transparent"
          : "bg-background/85 backdrop-blur border-b border-border/60")
      }
    >
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 md:h-20 md:px-8">
        {/* Mobile hamburger */}
        <button
          type="button"
          onClick={() => setMenuOpen((v) => !v)}
          aria-label={menuOpen ? "Close menu" : "Open menu"}
          aria-expanded={menuOpen}
          className={
            "md:hidden inline-flex h-9 w-9 items-center justify-center rounded-md transition-colors " +
            (overlay ? "text-white" : "text-foreground")
          }
        >
          {menuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>

        {/* Desktop nav (left) */}
        <nav
          className={
            "hidden md:flex items-center gap-6 text-xs font-medium uppercase tracking-[0.18em] transition-colors " +
            (overlay ? "text-white" : "text-foreground")
          }
        >
          <Link to="/shop" className="hover:opacity-70">
            Shop
          </Link>
          <Link to="/" className="hover:opacity-70">
            Home
          </Link>
        </nav>

        <Link to="/" className="absolute left-1/2 -translate-x-1/2" onClick={() => setMenuOpen(false)}>
          <img
            src={LOGO_URL}
            alt="Heaven Beauty"
            width={160}
            height={48}
            className={"h-10 w-auto md:h-12 " + (overlay ? "brightness-0 invert" : "")}
          />
        </Link>

        <div className="flex items-center gap-4">
          <CountrySwitcher light={overlay} />
          <Link
            to="/cart"
            className={
              "relative flex items-center gap-2 text-xs font-medium uppercase tracking-[0.18em] transition-colors " +
              (overlay ? "text-white" : "text-foreground")
            }
            aria-label="Cart"
          >
            <ShoppingBag className="h-4 w-4" />
            <span className="hidden sm:inline">Cart</span>
            <span className="absolute -top-2 -right-3 flex h-5 min-w-5 items-center justify-center rounded-full bg-primary px-1 text-[10px] font-semibold text-primary-foreground">
              {count}
            </span>
          </Link>
        </div>
      </div>

      {/* Mobile menu panel */}
      {menuOpen && (
        <div className="md:hidden border-t border-border/60 bg-background">
          <nav className="mx-auto flex max-w-7xl flex-col px-4 py-4 text-sm font-medium uppercase tracking-[0.18em] text-foreground">
            <Link
              to="/"
              onClick={() => setMenuOpen(false)}
              className="border-b border-border/50 py-3 hover:opacity-70"
            >
              Home
            </Link>
            <Link
              to="/shop"
              onClick={() => setMenuOpen(false)}
              className="border-b border-border/50 py-3 hover:opacity-70"
            >
              Shop
            </Link>
            <Link
              to="/our-story"
              onClick={() => setMenuOpen(false)}
              className="py-3 hover:opacity-70"
            >
              Our Story
            </Link>
          </nav>
        </div>
      )}
    </header>
  );
}
