import { defineMcp } from "@lovable.dev/mcp-js";
import listProductsTool from "./tools/list-products";
import getProductTool from "./tools/get-product";
import listCategoriesTool from "./tools/list-categories";
import createOrderTool from "./tools/create-order";

export default defineMcp({
  name: "heaven-beauty-mcp",
  title: "Heaven Beauty",
  version: "0.1.0",
  instructions:
    "Tools for the Heaven Beauty shop. Use `list_categories` and `list_products` to browse the catalog, `get_product` to fetch full details for a slug, and `create_order` to place a Cash-on-Delivery order.",
  tools: [listProductsTool, getProductTool, listCategoriesTool, createOrderTool],
});
