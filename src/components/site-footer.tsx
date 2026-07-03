import { Link } from "@tanstack/react-router";
import { Facebook, Instagram } from "lucide-react";

export function SiteFooter() {
  return (
    <footer className="bg-background pt-16">
      {/* Wordmark with divider lines */}
      <div className="mx-auto flex max-w-5xl items-center gap-6 px-6 md:px-8">
        <span className="h-px flex-1 bg-primary/40" />
        <h3
          className="text-primary text-2xl md:text-4xl"
          style={{ fontFamily: "var(--font-mattone)", fontWeight: 300 }}
        >
          Heaven Beauty
        </h3>
        <span className="h-px flex-1 bg-primary/40" />
      </div>

      {/* Columns */}
      <div className="mx-auto grid max-w-6xl grid-cols-2 gap-10 px-6 py-14 md:grid-cols-5 md:items-start md:gap-8 md:px-8">
        {/* Phone left */}
        <div className="col-span-2 md:col-span-1">
          <a
            href="tel:+96178835078"
            className="text-sm text-foreground/80 hover:text-primary"
          >
            +961 78 835 078
          </a>
        </div>

        <div>
          <h4 className="text-[11px] font-semibold uppercase tracking-[0.28em] text-primary">
            About
          </h4>
          <ul className="mt-5 space-y-2 text-sm text-foreground/80">
            <li>
              <Link to="/our-story" className="hover:text-primary">
                Our Story
              </Link>
            </li>
          </ul>
        </div>

        <div>
          <h4 className="text-[11px] font-semibold uppercase tracking-[0.28em] text-primary">
            Shop
          </h4>
          <ul className="mt-5 space-y-2 text-sm text-foreground/80">
            <li>
              <Link to="/shop" className="hover:text-primary">
                Shop
              </Link>
            </li>
          </ul>
        </div>

        <div>
          <h4 className="text-[11px] font-semibold uppercase tracking-[0.28em] text-primary">
            Care
          </h4>
          <ul className="mt-5 space-y-2 text-sm text-foreground/80">
            <li>
              <a href="#" className="hover:text-primary">
                Return
              </a>
            </li>
            <li>
              <a href="#" className="hover:text-primary">
                FAQ
              </a>
            </li>
          </ul>
        </div>

        {/* Email right */}
        <div className="col-span-2 md:col-span-1 md:text-right">
          <a
            href="mailto:service@myheavenbeauty.com"
            className="text-sm text-foreground/80 hover:text-primary"
          >
            service@myheavenbeauty.com
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
            <a href="#" className="hover:text-primary">
              Privacy Policy
            </a>
            <a href="#" className="hover:text-primary">
              Terms &amp; Conditions
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
