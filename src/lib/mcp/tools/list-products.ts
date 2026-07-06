import { defineTool } from "@lovable.dev/mcp-js";
import { z } from "zod";
import { getProducts } from "@/lib/woocommerce.functions";

export default defineTool({
  name: "list_products",
  title: "List products",
  description: "List Heaven Beauty shop products, optionally filtered by category id.",
  inputSchema: {
    category: z.number().int().positive().optional().describe("WooCommerce category id"),
    per_page: z.number().int().min(1).max(50).optional().describe("Number of products (default 24)"),
  },
  annotations: { readOnlyHint: true, idempotentHint: true, openWorldHint: false },
  handler: async ({ category, per_page }) => {
    const products = await getProducts({ data: { category, per_page } });
    const summary = products.map((p) => ({
      id: p.id,
      name: p.name,
      slug: p.slug,
      price: p.price,
      on_sale: p.on_sale,
      stock_status: p.stock_status,
      permalink: p.permalink,
    }));
    return {
      content: [{ type: "text", text: JSON.stringify(summary, null, 2) }],
      structuredContent: { products: summary },
    };
  },
});
