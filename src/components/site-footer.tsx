import { Link } from "@tanstack/react-router";
import { Facebook, Instagram } from "lucide-react";

export function SiteFooter() {
  return (
    <footer className="bg-background">
      {/* Brand wordmark */}
      <div className="mx-auto max-w-7xl px-6 pt-14 pb-8 text-center md:px-8">
        <h3
          className="text-primary text-3xl md:text-4xl"
          style={{ fontFamily: "var(--font-mattone)", fontWeight: 300 }}
        >
          Heaven Beauty
        </h3>
      </div>

      {/* Columns */}
      <div className="mx-auto grid max-w-6xl grid-cols-2 gap-10 px-6 pb-10 text-center md:grid-cols-[1fr_auto_auto_auto_1fr] md:items-start md:px-8 md:text-left">
        <div className="col-span-2 md:col-span-1">
          <h4 className="text-xs font-semibold uppercase tracking-[0.22em] text-foreground/80">
            Get in touch
          </h4>
        </div>

        <div>
          <h4 className="text-xs font-semibold uppercase tracking-[0.22em] text-primary">About</h4>
          <ul className="mt-4 space-y-2 text-sm text-foreground/80">
            <li>
              <a href="https://myheavenbeauty.com" target="_blank" rel="noreferrer" className="hover:text-primary">
                Our Story
              </a>
            </li>
          </ul>
        </div>

        <div>
          <h4 className="text-xs font-semibold uppercase tracking-[0.22em] text-primary">Shop</h4>
          <ul className="mt-4 space-y-2 text-sm text-foreground/80">
            <li>
              <Link to="/shop" className="hover:text-primary">
                Shop
              </Link>
            </li>
          </ul>
        </div>

        <div>
          <h4 className="text-xs font-semibold uppercase tracking-[0.22em] text-primary">Legal</h4>
          <ul className="mt-4 space-y-2 text-sm text-foreground/80">
            <li>
              <a href="https://myheavenbeauty.com/terms" target="_blank" rel="noreferrer" className="hover:text-primary">
                Terms
              </a>
            </li>
          </ul>
        </div>

        <div className="col-span-2 md:col-span-1 md:text-right">
          <a
            href="https://wa.me/9613359951"
            className="text-sm text-foreground/80 hover:text-primary"
          >
            +961 03 359 951
          </a>
        </div>
      </div>

      {/* Bottom bar */}
      <div className="border-t border-border/40">
        <div className="mx-auto grid max-w-6xl grid-cols-1 items-center gap-4 px-6 py-6 text-xs text-muted-foreground md:grid-cols-3 md:px-8">
          <p className="text-center md:text-left">
            Copyright © {new Date().getFullYear()} Heaven Beauty. All rights reserved.
          </p>
          <div className="flex items-center justify-center gap-5">
            <a
              href="https://facebook.com"
              target="_blank"
              rel="noreferrer"
              aria-label="Facebook"
              className="text-primary hover:opacity-70"
            >
              <Facebook className="h-4 w-4" />
            </a>
            <a
              href="https://instagram.com"
              target="_blank"
              rel="noreferrer"
              aria-label="Instagram"
              className="text-primary hover:opacity-70"
            >
              <Instagram className="h-4 w-4" />
            </a>
          </div>
          <div className="flex justify-center gap-4 md:justify-end">
            <a href="https://myheavenbeauty.com/privacy" className="hover:text-primary">
              Privacy Policy
            </a>
            <a href="https://myheavenbeauty.com/terms" className="hover:text-primary">
              Terms &amp; Conditions
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
