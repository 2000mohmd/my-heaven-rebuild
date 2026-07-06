import { createFileRoute } from "@tanstack/react-router";
import type {} from "@tanstack/react-start";
import { getProducts } from "@/lib/woocommerce.functions";

const BASE_URL = "https://my-heaven-rebuild.lovable.app";

interface SitemapEntry {
  path: string;
  changefreq?: "always" | "hourly" | "daily" | "weekly" | "monthly" | "yearly" | "never";
  priority?: string;
}

export const Route = createFileRoute("/sitemap.xml")({
  server: {
    handlers: {
      GET: async () => {
        const entries: SitemapEntry[] = [
          { path: "/", changefreq: "weekly", priority: "1.0" },
          { path: "/shop", changefreq: "weekly", priority: "0.9" },
          { path: "/our-story", changefreq: "monthly", priority: "0.6" },
        ];

        try {
          const products = await getProducts({ data: { per_page: 100 } });
          for (const p of products) {
            entries.push({ path: `/shop/${p.slug}`, changefreq: "weekly", priority: "0.8" });
          }
        } catch {
          // ignore product fetch errors in sitemap
        }

        const urls = entries.map(
          (e) =>
            `  <url>\n    <loc>${BASE_URL}${e.path}</loc>\n    <changefreq>${e.changefreq}</changefreq>\n    <priority>${e.priority}</priority>\n  </url>`,
        );

        const xml = [
          `<?xml version="1.0" encoding="UTF-8"?>`,
          `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">`,
          ...urls,
          `</urlset>`,
        ].join("\n");

        return new Response(xml, {
          headers: {
            "Content-Type": "application/xml",
            "Cache-Control": "public, max-age=3600",
          },
        });
      },
    },
  },
});
