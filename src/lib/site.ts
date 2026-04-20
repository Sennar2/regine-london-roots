import { supabase } from "@/integrations/supabase/client";
import logoFallback from "@/assets/regine-logo.png";

export const FALLBACK_LOGO = logoFallback;

export type SiteSettings = {
  logo_url: string | null;
  favicon_url: string | null;
  brand_tagline: string | null;
  brand_description: string | null;
  contact_email: string | null;
  contact_phone: string | null;
  address: string | null;
  hours_summary: string | null;
  social_links: Record<string, string> | null;
  footer_text: string | null;
  cta_text: string | null;
  map_embed_url: string | null;
  enquiry_text: string | null;
  hero_image_url: string | null;
  hero_eyebrow: string | null;
  hero_headline: string | null;
  hero_subheading: string | null;
  hero_cta_primary_label: string | null;
  hero_cta_primary_href: string | null;
  hero_cta_secondary_label: string | null;
  hero_cta_secondary_href: string | null;
};

export async function fetchSiteSettings(): Promise<SiteSettings | null> {
  const { data } = await supabase.from("site_settings").select("*").eq("id", 1).maybeSingle();
  return (data as SiteSettings | null) ?? null;
}

export function publicUrl(bucket: string, path: string) {
  const { data } = supabase.storage.from(bucket).getPublicUrl(path);
  return data.publicUrl;
}

/** Pick a social URL (case-insensitive) from site_settings.social_links */
export function getSocial(links: Record<string, string> | null | undefined, key: string): string | null {
  if (!links) return null;
  const lower = key.toLowerCase();
  for (const [k, v] of Object.entries(links)) {
    if (k.toLowerCase() === lower && typeof v === "string" && v.trim()) return v;
  }
  return null;
}
