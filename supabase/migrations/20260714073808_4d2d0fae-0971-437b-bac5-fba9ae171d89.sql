
-- Drop dependents, recreate with bigint id
DROP TABLE public.order_items;
DROP TABLE public.product_reviews;
DROP TABLE public.products;

CREATE SEQUENCE public.product_id_seq START 1;

CREATE TABLE public.products (
  id bigint PRIMARY KEY DEFAULT nextval('public.product_id_seq'),
  slug text NOT NULL UNIQUE,
  name text NOT NULL,
  short_description text NOT NULL DEFAULT '',
  description text NOT NULL DEFAULT '',
  price numeric NOT NULL DEFAULT 0,
  sale_price numeric,
  on_sale boolean NOT NULL DEFAULT false,
  stock_status text NOT NULL DEFAULT 'instock',
  images jsonb NOT NULL DEFAULT '[]'::jsonb,
  category_id uuid REFERENCES public.categories(id) ON DELETE SET NULL,
  sort_order integer NOT NULL DEFAULT 0,
  published boolean NOT NULL DEFAULT true,
  average_rating numeric NOT NULL DEFAULT 0,
  rating_count integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
ALTER SEQUENCE public.product_id_seq OWNED BY public.products.id;
CREATE INDEX products_category_idx ON public.products(category_id);
CREATE INDEX products_published_idx ON public.products(published);
GRANT SELECT ON public.products TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.products TO authenticated;
GRANT ALL ON public.products TO service_role;
GRANT USAGE, SELECT ON SEQUENCE public.product_id_seq TO authenticated, service_role;
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone reads published products" ON public.products FOR SELECT USING (published = true OR public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins insert products" ON public.products FOR INSERT TO authenticated WITH CHECK (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins update products" ON public.products FOR UPDATE TO authenticated USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins delete products" ON public.products FOR DELETE TO authenticated USING (public.has_role(auth.uid(), 'admin'));
CREATE TRIGGER products_updated BEFORE UPDATE ON public.products FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE TABLE public.product_reviews (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id bigint NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
  reviewer text NOT NULL,
  reviewer_email text NOT NULL,
  rating integer NOT NULL,
  review text NOT NULL,
  approved boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX product_reviews_product_idx ON public.product_reviews(product_id);
GRANT SELECT, INSERT ON public.product_reviews TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.product_reviews TO authenticated;
GRANT ALL ON public.product_reviews TO service_role;
ALTER TABLE public.product_reviews ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public reads approved reviews" ON public.product_reviews FOR SELECT USING (approved = true OR public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Anyone submits review" ON public.product_reviews FOR INSERT WITH CHECK (approved = false AND rating BETWEEN 1 AND 5);
CREATE POLICY "Admins update reviews" ON public.product_reviews FOR UPDATE TO authenticated USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins delete reviews" ON public.product_reviews FOR DELETE TO authenticated USING (public.has_role(auth.uid(), 'admin'));

CREATE TABLE public.order_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id uuid NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
  product_id bigint REFERENCES public.products(id) ON DELETE SET NULL,
  product_name text NOT NULL,
  unit_price numeric NOT NULL,
  quantity integer NOT NULL,
  line_total numeric NOT NULL
);
CREATE INDEX order_items_order_idx ON public.order_items(order_id);
GRANT INSERT ON public.order_items TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.order_items TO authenticated;
GRANT ALL ON public.order_items TO service_role;
ALTER TABLE public.order_items ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone inserts order items" ON public.order_items FOR INSERT WITH CHECK (true);
CREATE POLICY "Admins read order items" ON public.order_items FOR SELECT TO authenticated USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins update order items" ON public.order_items FOR UPDATE TO authenticated USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins delete order items" ON public.order_items FOR DELETE TO authenticated USING (public.has_role(auth.uid(), 'admin'));
