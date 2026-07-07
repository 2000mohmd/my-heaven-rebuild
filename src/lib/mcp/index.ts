import { auth, defineMcp } from "@lovable.dev/mcp-js";
import listProductsTool from "./tools/list-products";
import getProductTool from "./tools/get-product";
import listCategoriesTool from "./tools/list-categories";
import createOrderTool from "./tools/create-order";

const SUPABASE_URL = process.env.SUPABASE_URL ?? process.env.VITE_SUPABASE_URL ?? "";

export default defineMcp({
  name: "heaven-beauty-mcp",
  title: "Heaven Beauty",
  version: "0.1.0",
  instructions:
    "Tools for the Heaven Beauty shop. Use `list_categories` and `list_products` to browse the catalog, `get_product` to fetch full details for a slug, and `create_order` to place a Cash-on-Delivery order.",
  auth: auth.oauth.issuer({
    issuer: `${SUPABASE_URL}/auth/v1`,
    acceptedAudiences: ["authenticated"],
    resourceName: "Heaven Beauty MCP",
  }),
  tools: [listProductsTool, getProductTool, listCategoriesTool, createOrderTool],
});
