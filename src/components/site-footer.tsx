import { Link } from "@tanstack/react-router";

export function SiteFooter() {
  return (
    <footer className="mt-24 border-t border-border/60 bg-blush/40">
      <div className="mx-auto grid max-w-7xl gap-10 px-4 py-16 md:grid-cols-3 md:px-8">
        <div>
          <h3 className="font-display text-2xl">Heaven Beauty</h3>
          <p className="mt-3 max-w-xs text-sm text-muted-foreground">
            A touch of color designed to enhance your natural glow — soft, radiant, and effortlessly you.
          </p>
        </div>
        <div>
          <h4 className="text-xs font-semibold uppercase tracking-widest text-foreground/70">Shop</h4>
          <ul className="mt-4 space-y-2 text-sm">
            <li><Link to="/shop" className="hover:text-primary">All products</Link></li>
            <li><Link to="/shop" search={{ category: "heavenly-tint" }} className="hover:text-primary">Heavenly Tint</Link></li>
            <li><Link to="/shop" search={{ category: "sparkly-tint" }} className="hover:text-primary">Sparkly Tint</Link></li>
            <li><Link to="/shop" search={{ category: "devotion" }} className="hover:text-primary">Devotion</Link></li>
          </ul>
        </div>
        <div>
          <h4 className="text-xs font-semibold uppercase tracking-widest text-foreground/70">About</h4>
          <ul className="mt-4 space-y-2 text-sm">
            <li><a href="https://myheavenbeauty.com" className="hover:text-primary" target="_blank" rel="noreferrer">Our story</a></li>
            <li><a href="https://myheavenbeauty.com" className="hover:text-primary" target="_blank" rel="noreferrer">Contact</a></li>
          </ul>
        </div>
      </div>
      <div className="border-t border-border/60 py-6 text-center text-xs text-muted-foreground">
        © {new Date().getFullYear()} Heaven Beauty. All rights reserved.
      </div>
    </footer>
  );
}
