ALTER TABLE public.locations
  ADD COLUMN IF NOT EXISTS hero_eyebrow text,
  ADD COLUMN IF NOT EXISTS hero_title text,
  ADD COLUMN IF NOT EXISTS hero_subtitle text,
  ADD COLUMN IF NOT EXISTS hero_cta_label text,
  ADD COLUMN IF NOT EXISTS hero_cta_href text;