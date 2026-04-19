ALTER TABLE public.locations
  ADD COLUMN IF NOT EXISTS deliveroo_url text,
  ADD COLUMN IF NOT EXISTS justeat_url text,
  ADD COLUMN IF NOT EXISTS ubereats_url text,
  ADD COLUMN IF NOT EXISTS click_collect_url text,
  ADD COLUMN IF NOT EXISTS is_featured boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS full_description text;