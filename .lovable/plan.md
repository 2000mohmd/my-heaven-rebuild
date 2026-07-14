## Goal
Replace WooCommerce entirely with a native catalog + orders system stored in Lovable Cloud. Import existing products from myheavenbeauty.com once, then disconnect Woo.

## Scope

### 1. Database (migration)
New tables in `public`:
- **categories** — id, slug, name, image_url, sort_order
- **products** — id, slug, name, description, short_description, price (base USD), on_sale, sale_price, stock_status, images (jsonb array), category_id, sort_order, published
- **product_reviews** — id, product_id, reviewer, reviewer_email, rating (1–5), review, approved, created_at
- **orders** — id, order_number (auto), status (pending/confirmed/shipped/delivered/cancelled), customer_first_name, customer_last_name, email, phone, address, city, postcode, country, subtotal, total, currency, notes, created_at
- **order_items** — id, order_id, product_id, product_name, unit_price, quantity, line_total

RLS:
- Public read on published products, categories, approved reviews.
- Anyone can insert orders + order_items + reviews (with approved=false).
- Only admins can update/delete anything and see all orders/reviews.

### 2. One-time import
A `seed-from-woo.functions.ts` admin-only server fn that pulls all products, categories, reviews from `myheavenbeauty.com` via the direct REST API (using WOO_STORE_URL / WOO_CONSUMER_KEY / WOO_CONSUMER_SECRET already stored) and inserts them into the new tables. Triggered by a button in `/admin`.

### 3. Rewrite `woocommerce.functions.ts` → `shop.functions.ts`
Same public surface (getProducts, getProductBySlug, getCategories, getProductReviews, createProductReview, createOrder, listOrders) but backed by Supabase. Keep the WCProduct type shape so existing components don't break (map DB rows → same shape). Delete the Woo file after all imports are switched.

### 4. Email notification on new order
Uses Lovable's built-in email infrastructure (requires email domain setup — will prompt separately if not set up). `createOrder` enqueues an "order-received" email to a configurable admin address.

### 5. Admin UI
- `/admin` — add "Import from WooCommerce" button (one-time)
- `/admin/orders` — reads from Supabase orders table instead of Woo
- `/admin/products` (new) — list products, edit price/stock/publish toggle
- Keep `/admin/pricing` (country pricing) unchanged

### 6. Cleanup
- Remove `src/lib/mcp/tools/*` that hit Woo (create-order, get-product, list-products, list-categories) OR rewire them to shop.functions
- Remove Woo env vars references from checkout flow

## What stays the same
- Country picker & country_pricing overrides
- Cart (localStorage)
- COD checkout UI
- Public site design

## Hostinger env vars needed after this
Only:
```
NODE_ENV=production
PORT=3000
SUPABASE_URL=...
SUPABASE_PUBLISHABLE_KEY=...
VITE_SUPABASE_URL=...
VITE_SUPABASE_PUBLISHABLE_KEY=...
SUPABASE_SERVICE_ROLE_KEY=...   (needed for admin writes / order creation)
```
No LOVABLE_API_KEY, no WooCommerce keys.

⚠️ **Note on SUPABASE_SERVICE_ROLE_KEY**: this key is not exposable from Lovable Cloud. On Lovable hosting it's auto-injected and everything works. On Hostinger, admin features and order writes that use the service role will fail without it. If you host on Hostinger, order creation will need to be reworked to use only the publishable key + a permissive RLS insert policy (which we'll do — orders will be insertable by `anon`).

## Order of execution
1. Create DB migration (needs your approval)
2. After migration approved: write `shop.functions.ts`, rewrite checkout/shop/admin, add import button, add email trigger
3. You click "Import from WooCommerce" in admin once → catalog populated
4. Remove `woocommerce.functions.ts` and Woo secrets

Ready to proceed with step 1 (the database migration)?
