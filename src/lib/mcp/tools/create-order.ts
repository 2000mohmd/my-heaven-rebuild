import { defineTool } from "@lovable.dev/mcp-js";
import { z } from "zod";
import { createOrder } from "@/lib/woocommerce.functions";

export default defineTool({
  name: "create_order",
  title: "Create order",
  description:
    "Create a Cash-on-Delivery order in Heaven Beauty for the given billing details and line items.",
  inputSchema: {
    billing: z.object({
      first_name: z.string().min(1),
      last_name: z.string().min(1),
      address_1: z.string().min(1),
      city: z.string().min(1),
      postcode: z.string().optional(),
      country: z.string().min(2).describe("ISO 3166-1 alpha-2 country code"),
      email: z.string().email(),
      phone: z.string().min(3),
    }),
    line_items: z
      .array(z.object({ product_id: z.number().int().positive(), quantity: z.number().int().min(1) }))
      .min(1),
  },
  annotations: { readOnlyHint: false, destructiveHint: false, openWorldHint: true },
  handler: async ({ billing, line_items }) => {
    const order = await createOrder({
      data: { billing: { postcode: "", ...billing }, line_items },
    });
    return {
      content: [
        { type: "text", text: `Order #${order.number} created. Total: ${order.total}` },
      ],
      structuredContent: { order },
    };
  },
});
