
-- Roles
CREATE TYPE public.app_role AS ENUM ('admin', 'editor');

CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role app_role NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (user_id, role)
);
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role app_role)
RETURNS BOOLEAN
LANGUAGE SQL STABLE SECURITY DEFINER SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles WHERE user_id = _user_id AND role = _role
  )
$$;

CREATE POLICY "Users can view their own roles" ON public.user_roles
  FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Admins can view all roles" ON public.user_roles
  FOR SELECT TO authenticated USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can manage roles" ON public.user_roles
  FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- Bootstrap: first signed-up user becomes admin if no admins exist
CREATE OR REPLACE FUNCTION public.bootstrap_first_admin()
RETURNS TRIGGER
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM public.user_roles WHERE role = 'admin') THEN
    INSERT INTO public.user_roles (user_id, role) VALUES (NEW.id, 'admin');
  END IF;
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_auth_user_created_bootstrap_admin
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.bootstrap_first_admin();

-- Updated-at helper
CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS TRIGGER LANGUAGE plpgsql SET search_path = public AS $$
BEGIN NEW.updated_at = now(); RETURN NEW; END;
$$;

-- Locations
CREATE TABLE public.locations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  area TEXT,
  address TEXT,
  postcode TEXT,
  phone TEXT,
  email TEXT,
  opening_hours JSONB DEFAULT '[]'::jsonb,
  description TEXT,
  hero_image_url TEXT,
  gallery_image_urls JSONB DEFAULT '[]'::jsonb,
  maps_link TEXT,
  booking_link TEXT,
  is_active BOOLEAN NOT NULL DEFAULT true,
  display_order INT NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.locations ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public can view active locations" ON public.locations FOR SELECT USING (is_active = true);
CREATE POLICY "Admins can view all locations" ON public.locations FOR SELECT TO authenticated USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can manage locations" ON public.locations FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));
CREATE TRIGGER trg_locations_updated BEFORE UPDATE ON public.locations FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- Menus
CREATE TABLE public.menus (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  description TEXT,
  category TEXT,
  location_id UUID REFERENCES public.locations(id) ON DELETE SET NULL,
  pdf_url TEXT,
  external_url TEXT,
  is_active BOOLEAN NOT NULL DEFAULT true,
  is_featured BOOLEAN NOT NULL DEFAULT false,
  display_order INT NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.menus ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public can view active menus" ON public.menus FOR SELECT USING (is_active = true);
CREATE POLICY "Admins can view all menus" ON public.menus FOR SELECT TO authenticated USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can manage menus" ON public.menus FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));
CREATE TRIGGER trg_menus_updated BEFORE UPDATE ON public.menus FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- Files
CREATE TABLE public.files (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  category TEXT,
  file_url TEXT,
  external_url TEXT,
  location_id UUID REFERENCES public.locations(id) ON DELETE SET NULL,
  is_active BOOLEAN NOT NULL DEFAULT true,
  display_order INT NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.files ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public can view active files" ON public.files FOR SELECT USING (is_active = true);
CREATE POLICY "Admins can view all files" ON public.files FOR SELECT TO authenticated USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can manage files" ON public.files FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));
CREATE TRIGGER trg_files_updated BEFORE UPDATE ON public.files FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- Gallery
CREATE TABLE public.gallery_images (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  image_url TEXT NOT NULL,
  caption TEXT,
  alt_text TEXT,
  location_id UUID REFERENCES public.locations(id) ON DELETE SET NULL,
  is_featured BOOLEAN NOT NULL DEFAULT false,
  is_active BOOLEAN NOT NULL DEFAULT true,
  display_order INT NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.gallery_images ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public can view active gallery" ON public.gallery_images FOR SELECT USING (is_active = true);
CREATE POLICY "Admins can view all gallery" ON public.gallery_images FOR SELECT TO authenticated USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can manage gallery" ON public.gallery_images FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));
CREATE TRIGGER trg_gallery_updated BEFORE UPDATE ON public.gallery_images FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- Links
CREATE TABLE public.links (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  label TEXT NOT NULL,
  url TEXT NOT NULL,
  category TEXT,
  display_order INT NOT NULL DEFAULT 0,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.links ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public can view active links" ON public.links FOR SELECT USING (is_active = true);
CREATE POLICY "Admins can view all links" ON public.links FOR SELECT TO authenticated USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can manage links" ON public.links FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));
CREATE TRIGGER trg_links_updated BEFORE UPDATE ON public.links FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- About content (singleton)
CREATE TABLE public.about_content (
  id INT PRIMARY KEY DEFAULT 1,
  headline TEXT,
  intro TEXT,
  story TEXT,
  image_urls JSONB DEFAULT '[]'::jsonb,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT about_singleton CHECK (id = 1)
);
ALTER TABLE public.about_content ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public can view about" ON public.about_content FOR SELECT USING (true);
CREATE POLICY "Admins can manage about" ON public.about_content FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));
CREATE TRIGGER trg_about_updated BEFORE UPDATE ON public.about_content FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- Site settings (singleton)
CREATE TABLE public.site_settings (
  id INT PRIMARY KEY DEFAULT 1,
  logo_url TEXT,
  favicon_url TEXT,
  brand_tagline TEXT,
  brand_description TEXT,
  contact_email TEXT,
  contact_phone TEXT,
  address TEXT,
  hours_summary TEXT,
  social_links JSONB DEFAULT '{}'::jsonb,
  footer_text TEXT,
  cta_text TEXT,
  map_embed_url TEXT,
  enquiry_text TEXT,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT settings_singleton CHECK (id = 1)
);
ALTER TABLE public.site_settings ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public can view site settings" ON public.site_settings FOR SELECT USING (true);
CREATE POLICY "Admins can manage site settings" ON public.site_settings FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));
CREATE TRIGGER trg_settings_updated BEFORE UPDATE ON public.site_settings FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- Contact messages
CREATE TABLE public.contact_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT,
  subject TEXT,
  message TEXT NOT NULL,
  location_id UUID REFERENCES public.locations(id) ON DELETE SET NULL,
  is_read BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.contact_messages ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can submit contact messages" ON public.contact_messages FOR INSERT WITH CHECK (true);
CREATE POLICY "Admins can view contact messages" ON public.contact_messages FOR SELECT TO authenticated USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can manage contact messages" ON public.contact_messages FOR UPDATE TO authenticated USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can delete contact messages" ON public.contact_messages FOR DELETE TO authenticated USING (public.has_role(auth.uid(), 'admin'));

-- Storage buckets
INSERT INTO storage.buckets (id, name, public) VALUES
  ('branding', 'branding', true),
  ('locations', 'locations', true),
  ('menus', 'menus', true),
  ('gallery', 'gallery', true),
  ('files', 'files', true);

CREATE POLICY "Public read all brand buckets" ON storage.objects FOR SELECT
  USING (bucket_id IN ('branding','locations','menus','gallery','files'));
CREATE POLICY "Admins can upload to brand buckets" ON storage.objects FOR INSERT TO authenticated
  WITH CHECK (bucket_id IN ('branding','locations','menus','gallery','files') AND public.has_role(auth.uid(),'admin'));
CREATE POLICY "Admins can update brand buckets" ON storage.objects FOR UPDATE TO authenticated
  USING (bucket_id IN ('branding','locations','menus','gallery','files') AND public.has_role(auth.uid(),'admin'));
CREATE POLICY "Admins can delete from brand buckets" ON storage.objects FOR DELETE TO authenticated
  USING (bucket_id IN ('branding','locations','menus','gallery','files') AND public.has_role(auth.uid(),'admin'));

-- Seed singletons
INSERT INTO public.about_content (id, headline, intro, story) VALUES (
  1,
  'A Southern Italian family, at home in London',
  'Reginè is a family-run pizzeria bringing the warmth of Southern Italy to London neighbourhoods — proper dough, simple ingredients, and a welcome that feels like home.',
  'Our story begins in the South of Italy, around long tables, late evenings and the smell of tomato, basil and wood-fired crust. We brought those memories with us to London and built Reginè around them: hand-stretched pizza, considered ingredients, and the kind of hospitality that has been in our family for generations. Every guest is family. Every plate is made the way our grandmothers would expect.'
);

INSERT INTO public.site_settings (id, brand_tagline, brand_description, contact_email, contact_phone, address, hours_summary, social_links, footer_text, cta_text, enquiry_text) VALUES (
  1,
  'Southern Italian warmth, served in London.',
  'Reginè Pizzeria — a Southern Italian family pizzeria in London. Authentic pizza, simple ingredients, proper hospitality.',
  'hello@regine-pizzeria.co.uk',
  '+44 20 0000 0000',
  'Wandsworth, London',
  'Tue–Sun · 12:00–22:00 · Closed Mondays',
  '{"instagram":"https://instagram.com/regine.pizzeria","facebook":""}'::jsonb,
  '© Reginè Pizzeria · Made with care in London',
  'View Menus',
  'Tell us about your visit, a booking enquiry, or a private event. We''ll come back to you within a day.'
);

-- Seed Wandsworth
INSERT INTO public.locations (name, slug, area, address, postcode, phone, email, opening_hours, description, maps_link, display_order) VALUES (
  'Reginè Wandsworth',
  'wandsworth',
  'Wandsworth',
  'Wandsworth High Street, London',
  'SW18',
  '+44 20 0000 0000',
  'wandsworth@regine-pizzeria.co.uk',
  '[
    {"day":"Monday","hours":"Closed"},
    {"day":"Tuesday","hours":"12:00 – 22:00"},
    {"day":"Wednesday","hours":"12:00 – 22:00"},
    {"day":"Thursday","hours":"12:00 – 22:00"},
    {"day":"Friday","hours":"12:00 – 23:00"},
    {"day":"Saturday","hours":"12:00 – 23:00"},
    {"day":"Sunday","hours":"12:00 – 21:00"}
  ]'::jsonb,
  'Our first home in London — a neighbourhood pizzeria in Wandsworth serving Southern Italian pizza, antipasti and warm Italian hospitality.',
  'https://maps.google.com/?q=Wandsworth+London',
  1
);
