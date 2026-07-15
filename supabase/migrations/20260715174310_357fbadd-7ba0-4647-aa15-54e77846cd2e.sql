
-- 1) Hide reviewer_email from public/anon and authenticated SELECT via column-level revoke.
REVOKE SELECT (reviewer_email) ON public.product_reviews FROM anon, authenticated;

-- Ensure inserts still work (public insert path uses INSERT column privileges).
GRANT INSERT (product_id, reviewer, reviewer_email, review, rating) ON public.product_reviews TO anon, authenticated;

-- 2) Replace always-true INSERT policies with sane validation.
DROP POLICY IF EXISTS "Anyone can place order" ON public.orders;
CREATE POLICY "Anyone can place order"
  ON public.orders
  FOR INSERT
  TO public
  WITH CHECK (
    length(btrim(email)) > 0
    AND length(btrim(customer_first_name)) > 0
    AND length(btrim(customer_last_name)) > 0
    AND length(btrim(address)) > 0
    AND length(btrim(city)) > 0
    AND length(btrim(country)) > 0
    AND length(btrim(phone)) > 0
    AND subtotal >= 0
    AND total >= 0
    AND status = 'pending'
  );

DROP POLICY IF EXISTS "Anyone inserts order items" ON public.order_items;
CREATE POLICY "Anyone inserts order items"
  ON public.order_items
  FOR INSERT
  TO public
  WITH CHECK (
    quantity > 0
    AND unit_price >= 0
    AND line_total >= 0
    AND length(btrim(product_name)) > 0
    AND EXISTS (SELECT 1 FROM public.orders o WHERE o.id = order_id)
  );
