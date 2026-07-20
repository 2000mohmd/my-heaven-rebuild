REVOKE ALL ON FUNCTION public.validate_checkout_order_item() FROM PUBLIC;
REVOKE ALL ON FUNCTION public.validate_checkout_order_item() FROM anon;
REVOKE ALL ON FUNCTION public.validate_checkout_order_item() FROM authenticated;
REVOKE ALL ON FUNCTION public.validate_checkout_order_item() FROM service_role;
GRANT EXECUTE ON FUNCTION public.validate_checkout_order_item() TO postgres;