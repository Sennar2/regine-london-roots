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
};

export async function fetchSiteSettings(): Promise<SiteSettings | null> {
  const { data } = await supabase.from("site_settings").select("*").eq("id", 1).maybeSingle();
  return (data as SiteSettings | null) ?? null;
}

export function publicUrl(bucket: string, path: string) {
  const { data } = supabase.storage.from(bucket).getPublicUrl(path);
  return data.publicUrl;
}
