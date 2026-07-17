DROP POLICY IF EXISTS "Anyone inserts order items" ON public.order_items;
CREATE POLICY "Insert items for fresh pending order"
  ON public.order_items
  FOR INSERT
  TO public
  WITH CHECK (
    quantity > 0
    AND unit_price >= 0
    AND line_total >= 0
    AND length(btrim(product_name)) > 0
    AND EXISTS (
      SELECT 1 FROM public.orders o
      WHERE o.id = order_id
        AND o.status = 'pending'
        AND o.created_at > (now() - interval '5 minutes')
    )
  );