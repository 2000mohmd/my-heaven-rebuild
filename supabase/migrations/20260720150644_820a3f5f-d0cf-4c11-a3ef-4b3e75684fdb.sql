CREATE OR REPLACE FUNCTION public.validate_checkout_order_item()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM public.orders o
    WHERE o.id = NEW.order_id
      AND o.status = 'pending'
      AND o.created_at > now() - interval '5 minutes'
  ) THEN
    RAISE EXCEPTION 'Invalid checkout order item';
  END IF;

  RETURN NEW;
END;
$$;

REVOKE ALL ON FUNCTION public.validate_checkout_order_item() FROM PUBLIC;

DROP TRIGGER IF EXISTS validate_checkout_order_item_before_insert ON public.order_items;
CREATE TRIGGER validate_checkout_order_item_before_insert
  BEFORE INSERT ON public.order_items
  FOR EACH ROW
  EXECUTE FUNCTION public.validate_checkout_order_item();