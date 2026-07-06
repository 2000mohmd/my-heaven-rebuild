import { defineTool } from "@lovable.dev/mcp-js";
import { z } from "zod";
import { getProductBySlug } from "@/lib/woocommerce.functions";

export default defineTool({
  name: "get_product",
  title: "Get product",
  description: "Fetch full details for a Heaven Beauty product by its slug.",
  inputSchema: {
    slug: z.string().min(1).describe("Product slug, e.g. 'heavenly-tint'"),
  },
  annotations: { readOnlyHint: true, idempotentHint: true, openWorldHint: false },
  handler: async ({ slug }) => {
    const product = await getProductBySlug({ data: { slug } });
    if (!product) {
      return { content: [{ type: "text", text: `No product found for slug: ${slug}` }], isError: true };
    }
    const trimmed = {
      id: product.id,
      name: product.name,
      slug: product.slug,
      permalink: product.permalink,
      price: product.price,
      regular_price: product.regular_price,
      sale_price: product.sale_price,
      on_sale: product.on_sale,
      stock_status: product.stock_status,
      short_description: product.short_description,
      description: product.description,
      images: product.images.map((i) => ({ src: i.src, alt: i.alt })),
      categories: product.categories.map((c) => ({ id: c.id, name: c.name, slug: c.slug })),
      average_rating: product.average_rating,
      rating_count: product.rating_count,
    };
    return {
      content: [{ type: "text", text: JSON.stringify(trimmed, null, 2) }],
      structuredContent: { product: trimmed },
    };
  },
});
