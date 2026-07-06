
## Goal

Run one storefront across 4 countries (Lebanon, UAE, Egypt, Jordan) with:
- Auto-detected country on first visit + a country/currency popup before the user can browse
- Fixed prices per country (LBP/USD, AED, EGP, JOD)
- Some products hidden per country (client controls availability)
- A private admin panel for the client to manage per-country prices/availability and view orders — WITHOUT giving them WordPress/Woo access

## User-facing behavior

1. **First visit** → full-screen popup: "Choose your country" with 4 flags. Auto-highlights the detected country (from Cloudflare `cf-ipcountry` header, read server-side). User must pick one to enter.
2. Choice saved in a cookie (`country=AE`) for 90 days.
3. A small country switcher in the header lets them change later.
4. All product prices, currency symbol, and product visibility react to the chosen country.
5. Products unavailable in that country simply don't appear in the shop grid, and their `/shop/:slug` page shows "Not available in your region".
6. Cart & checkout show the chosen country's currency and totals.

## Admin panel

- Route: `/admin` (protected, role-based — not the same as customer accounts).
- Sections:
  - **Products & Pricing** — table of all Woo products × 4 countries. Client edits price and toggles availability per country. Autosaves.
  - **Orders** — list of recent WooCommerce orders (pulled via the connector), with status, customer, country, total. Read-only for now (order status changes still happen in Woo admin).
  - **Settings** — currency symbols, default per country.
- Login is separate from customer login (no Woo access leaks).

## Technical design

- **Enable Lovable Cloud** — needed for the admin auth + pricing overrides table.
- **DB tables** (Cloud):
  - `country_pricing(product_id int, country_code text, price numeric, currency text, available bool, updated_at)` — PK (product_id, country_code). Public SELECT (anon) so the storefront can read; INSERT/UPDATE only via admin role.
  - `user_roles(user_id uuid, role app_role)` + `has_role()` function (standard pattern) — with an `admin` role.
- **Country detection**: `createServerFn` reads `cf-ipcountry` from request headers, falls back to `LB`. Client reads cookie first, calls server fn if missing.
- **Product listing**: `listProducts` server fn joins Woo product list with the `country_pricing` table for the chosen country → filters out `available=false`, overrides `price`, sets currency.
- **Country config**: `{ LB: {currency:'USD', symbol:'$'}, AE: {currency:'AED', symbol:'AED'}, EG: {currency:'EGP', symbol:'E£'}, JO: {currency:'JOD', symbol:'JD'} }`. (Lebanon commonly prices in USD — I'll default to that; easy to switch to LBP if you want.)
- **Orders view**: admin server fn hits Woo `/orders?per_page=50` through the existing connector, returns to admin UI.

## Files I'll create / edit

- `supabase/migrations/*` — `country_pricing` table + grants + RLS, `user_roles` + `has_role`, `app_role` enum
- `src/lib/country.ts` — country config, symbols, formatting
- `src/lib/country.functions.ts` — `detectCountry` (reads cf-ipcountry), `setCountry` (cookie)
- `src/lib/pricing.functions.ts` — `getCountryPricing(country)` returning a map, `upsertCountryPrice` (admin)
- `src/hooks/use-country.tsx` — context + hook exposing `country`, `setCountry`, currency, formatter
- `src/components/country-picker-modal.tsx` — first-visit popup
- `src/components/country-switcher.tsx` — header dropdown
- `src/routes/__root.tsx` — mount provider + modal
- `src/routes/admin.tsx` — layout with role gate
- `src/routes/admin.index.tsx` — dashboard
- `src/routes/admin.pricing.tsx` — editable grid
- `src/routes/admin.orders.tsx` — orders list
- `src/routes/auth.tsx` — admin login (email/password)
- Update `src/lib/woocommerce.functions.ts` — `listOrders`, and augment `listProducts` to apply country overrides
- Update `product-card.tsx`, `shop.index.tsx`, `shop.$slug.tsx`, `cart.tsx`, `checkout.tsx` to use `useCountry()` for price/currency display and to hide unavailable items

## Open questions before I start

- **Lebanon currency**: USD (fresh dollar pricing, common now) or LBP? I'll default to USD unless you say otherwise.
- **Admin login**: I'll create ONE admin user with email + password you give me later (or you can sign up and I'll grant admin via SQL). OK?
- **Existing prices**: when a product has no override row for a country, do we (a) hide it, or (b) show the Woo base price converted at a fixed rate you set? I recommend **hide it** — forces the client to explicitly price each product per country so nothing ships at a wrong number.

Reply "go" (or with tweaks) and I'll build it.
