
-- Roles system
CREATE TYPE public.app_role AS ENUM ('admin', 'user');

CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role public.app_role NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (user_id, role)
);
GRANT SELECT ON public.user_roles TO authenticated;
GRANT ALL ON public.user_roles TO service_role;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can read their own roles"
  ON public.user_roles FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role public.app_role)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles WHERE user_id = _user_id AND role = _role
  )
$$;

-- Country pricing overrides
CREATE TABLE public.country_pricing (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id INTEGER NOT NULL,
  country_code TEXT NOT NULL CHECK (country_code IN ('LB','AE','EG','JO')),
  price NUMERIC(12,2) NOT NULL DEFAULT 0,
  available BOOLEAN NOT NULL DEFAULT true,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (product_id, country_code)
);
GRANT SELECT ON public.country_pricing TO anon, authenticated;
GRANT INSERT, UPDATE, DELETE ON public.country_pricing TO authenticated;
GRANT ALL ON public.country_pricing TO service_role;
ALTER TABLE public.country_pricing ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read country pricing"
  ON public.country_pricing FOR SELECT
  TO anon, authenticated
  USING (true);

CREATE POLICY "Admins can insert country pricing"
  ON public.country_pricing FOR INSERT
  TO authenticated
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can update country pricing"
  ON public.country_pricing FOR UPDATE
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can delete country pricing"
  ON public.country_pricing FOR DELETE
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

CREATE INDEX country_pricing_country_idx ON public.country_pricing(country_code);
