ALTER TABLE public.site_settings
  ADD COLUMN IF NOT EXISTS hero_image_url text,
  ADD COLUMN IF NOT EXISTS hero_eyebrow text,
  ADD COLUMN IF NOT EXISTS hero_headline text,
  ADD COLUMN IF NOT EXISTS hero_subheading text,
  ADD COLUMN IF NOT EXISTS hero_cta_primary_label text,
  ADD COLUMN IF NOT EXISTS hero_cta_primary_href text,
  ADD COLUMN IF NOT EXISTS hero_cta_secondary_label text,
  ADD COLUMN IF NOT EXISTS hero_cta_secondary_href text;