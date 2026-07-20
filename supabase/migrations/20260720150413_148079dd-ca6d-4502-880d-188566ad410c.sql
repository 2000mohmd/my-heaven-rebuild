DROP FUNCTION IF EXISTS public.place_checkout_order(jsonb, jsonb);

DROP POLICY IF EXISTS "Insert items for fresh pending order" ON public.order_items;

CREATE POLICY "Anyone can insert validated order items"
  ON public.order_items
  FOR INSERT
  TO anon, authenticated
  WITH CHECK (
    order_id IS NOT NULL
    AND quantity > 0
    AND quantity <= 99
    AND unit_price >= 0
    AND line_total = unit_price * quantity
    AND length(btrim(product_name)) > 0
    AND product_id IS NOT NULL
  );