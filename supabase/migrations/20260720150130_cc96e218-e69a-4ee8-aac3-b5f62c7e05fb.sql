CREATE OR REPLACE FUNCTION public.place_checkout_order(
  _billing jsonb,
  _line_items jsonb
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  _first_name text := btrim(coalesce(_billing->>'first_name', ''));
  _last_name text := btrim(coalesce(_billing->>'last_name', ''));
  _address text := btrim(coalesce(_billing->>'address_1', ''));
  _city text := btrim(coalesce(_billing->>'city', ''));
  _postcode text := btrim(coalesce(_billing->>'postcode', ''));
  _country text := upper(btrim(coalesce(_billing->>'country', '')));
  _email text := lower(btrim(coalesce(_billing->>'email', '')));
  _phone text := btrim(coalesce(_billing->>'phone', ''));
  _subtotal numeric := 0;
  _order_id uuid;
  _order_number text;
  _item jsonb;
  _product_id bigint;
  _quantity integer;
  _product record;
  _override record;
  _unit_price numeric;
  _line_total numeric;
  _lines jsonb := '[]'::jsonb;
BEGIN
  IF _first_name = '' OR _last_name = '' OR _address = '' OR _city = '' OR _country = '' OR _email = '' OR _phone = '' THEN
    RAISE EXCEPTION 'Missing required checkout details';
  END IF;

  IF _email !~* '^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$' THEN
    RAISE EXCEPTION 'Invalid email address';
  END IF;

  IF jsonb_typeof(_line_items) IS DISTINCT FROM 'array' OR jsonb_array_length(_line_items) = 0 THEN
    RAISE EXCEPTION 'Your bag is empty';
  END IF;

  FOR _item IN SELECT value FROM jsonb_array_elements(_line_items)
  LOOP
    _product_id := nullif(_item->>'product_id', '')::bigint;
    _quantity := nullif(_item->>'quantity', '')::integer;

    IF _product_id IS NULL OR _quantity IS NULL OR _quantity < 1 OR _quantity > 99 THEN
      RAISE EXCEPTION 'Invalid order item';
    END IF;

    SELECT id, name, price, sale_price, on_sale, stock_status, published
      INTO _product
      FROM public.products
      WHERE id = _product_id;

    IF NOT FOUND THEN
      RAISE EXCEPTION 'Product % not found', _product_id;
    END IF;

    IF NOT (_product.published AND _product.stock_status = 'instock') THEN
      RAISE EXCEPTION 'Product "%" is unavailable', _product.name;
    END IF;

    SELECT price, available
      INTO _override
      FROM public.country_pricing
      WHERE product_id = _product_id AND country_code = _country;

    IF FOUND THEN
      IF NOT _override.available THEN
        RAISE EXCEPTION 'Product "%" is unavailable in %', _product.name, _country;
      END IF;
      _unit_price := _override.price;
    ELSE
      _unit_price := CASE WHEN _product.on_sale AND _product.sale_price IS NOT NULL THEN _product.sale_price ELSE _product.price END;
    END IF;

    IF _unit_price IS NULL OR _unit_price < 0 THEN
      RAISE EXCEPTION 'Invalid product price';
    END IF;

    _line_total := _unit_price * _quantity;
    _subtotal := _subtotal + _line_total;
    _lines := _lines || jsonb_build_object(
      'product_id', _product_id,
      'product_name', _product.name,
      'unit_price', _unit_price,
      'quantity', _quantity,
      'line_total', _line_total
    );
  END LOOP;

  INSERT INTO public.orders (
    customer_first_name,
    customer_last_name,
    email,
    phone,
    address,
    city,
    postcode,
    country,
    subtotal,
    total,
    currency,
    payment_method,
    status
  ) VALUES (
    _first_name,
    _last_name,
    _email,
    _phone,
    _address,
    _city,
    _postcode,
    _country,
    _subtotal,
    _subtotal,
    'USD',
    'cod',
    'pending'
  )
  RETURNING id, order_number INTO _order_id, _order_number;

  INSERT INTO public.order_items (order_id, product_id, product_name, unit_price, quantity, line_total)
  SELECT
    _order_id,
    (line->>'product_id')::bigint,
    line->>'product_name',
    (line->>'unit_price')::numeric,
    (line->>'quantity')::integer,
    (line->>'line_total')::numeric
  FROM jsonb_array_elements(_lines) AS line;

  RETURN jsonb_build_object(
    'id', _order_id,
    'order_number', _order_number,
    'total', _subtotal,
    'lines', _lines
  );
END;
$$;

REVOKE ALL ON FUNCTION public.place_checkout_order(jsonb, jsonb) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.place_checkout_order(jsonb, jsonb) TO anon, authenticated;