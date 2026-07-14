import { defineTool } from "@lovable.dev/mcp-js";
import { getCategories } from "@/lib/shop.functions";

export default defineTool({
  name: "list_categories",
  title: "List categories",
  description: "List Heaven Beauty product categories.",
  inputSchema: {},
  annotations: { readOnlyHint: true, idempotentHint: true, openWorldHint: false },
  handler: async () => {
    const cats = await getCategories();
    return {
      content: [{ type: "text", text: JSON.stringify(cats, null, 2) }],
      structuredContent: { categories: cats },
    };
  },
});
