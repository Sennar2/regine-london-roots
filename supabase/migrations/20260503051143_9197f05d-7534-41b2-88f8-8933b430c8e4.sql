
ALTER TABLE public.site_settings
  ADD COLUMN IF NOT EXISTS launch_mode_enabled boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS launch_title text,
  ADD COLUMN IF NOT EXISTS launch_subtitle text,
  ADD COLUMN IF NOT EXISTS launch_date timestamptz,
  ADD COLUMN IF NOT EXISTS launch_countdown_enabled boolean NOT NULL DEFAULT true,
  ADD COLUMN IF NOT EXISTS launch_primary_label text,
  ADD COLUMN IF NOT EXISTS launch_primary_href text,
  ADD COLUMN IF NOT EXISTS launch_secondary_label text,
  ADD COLUMN IF NOT EXISTS launch_secondary_href text,
  ADD COLUMN IF NOT EXISTS launch_whatsapp_enabled boolean NOT NULL DEFAULT true,
  ADD COLUMN IF NOT EXISTS launch_instagram_enabled boolean NOT NULL DEFAULT true,
  ADD COLUMN IF NOT EXISTS launch_background_url text,
  ADD COLUMN IF NOT EXISTS launch_dismissible boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS whatsapp_number text,
  ADD COLUMN IF NOT EXISTS whatsapp_url text,
  ADD COLUMN IF NOT EXISTS whatsapp_default_message text,
  ADD COLUMN IF NOT EXISTS whatsapp_button_label text;

UPDATE public.site_settings
SET
  launch_mode_enabled = true,
  launch_title = COALESCE(launch_title, 'Reginè arriviamo.'),
  launch_subtitle = COALESCE(launch_subtitle, 'Wandsworth'),
  launch_date = COALESCE(launch_date, '2026-06-01 00:00:00+00'::timestamptz),
  whatsapp_button_label = COALESCE(whatsapp_button_label, 'Order via WhatsApp')
WHERE id = 1;

ALTER TABLE public.locations
  ADD COLUMN IF NOT EXISTS whatsapp_number text,
  ADD COLUMN IF NOT EXISTS whatsapp_url text,
  ADD COLUMN IF NOT EXISTS whatsapp_message text;

CREATE TABLE IF NOT EXISTS public.site_popups (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  enabled boolean NOT NULL DEFAULT false,
  popup_type text NOT NULL DEFAULT 'standard',
  title text,
  subtitle text,
  message text,
  supporting_text text,
  countdown_enabled boolean NOT NULL DEFAULT false,
  countdown_target timestamptz,
  primary_label text,
  primary_href text,
  secondary_label text,
  secondary_href text,
  whatsapp_cta_enabled boolean NOT NULL DEFAULT false,
  dismissible boolean NOT NULL DEFAULT true,
  background_url text,
  overlay_opacity numeric NOT NULL DEFAULT 0.6,
  start_at timestamptz,
  end_at timestamptz,
  display_order integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.site_popups ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public can view enabled popups" ON public.site_popups;
CREATE POLICY "Public can view enabled popups"
ON public.site_popups FOR SELECT
TO public
USING (enabled = true);

DROP POLICY IF EXISTS "Admins can view all popups" ON public.site_popups;
CREATE POLICY "Admins can view all popups"
ON public.site_popups FOR SELECT
TO authenticated
USING (has_role(auth.uid(), 'admin'::app_role));

DROP POLICY IF EXISTS "Admins can manage popups" ON public.site_popups;
CREATE POLICY "Admins can manage popups"
ON public.site_popups FOR ALL
TO authenticated
USING (has_role(auth.uid(), 'admin'::app_role))
WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

DROP TRIGGER IF EXISTS site_popups_set_updated_at ON public.site_popups;
CREATE TRIGGER site_popups_set_updated_at
BEFORE UPDATE ON public.site_popups
FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
