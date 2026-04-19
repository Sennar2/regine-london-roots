import { createFileRoute } from "@tanstack/react-router";
import { createClient } from "@supabase/supabase-js";

export const Route = createFileRoute("/sitemap.xml")({
  server: {
    handlers: {
      GET: async ({ request }) => {
        const url = new URL(request.url);
        const origin = `${url.protocol}//${url.host}`;

        const SUPABASE_URL = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
        const SUPABASE_KEY = process.env.SUPABASE_PUBLISHABLE_KEY || process.env.VITE_SUPABASE_PUBLISHABLE_KEY;

        let locationSlugs: { slug: string; updated_at: string }[] = [];
        if (SUPABASE_URL && SUPABASE_KEY) {
          try {
            const sb = createClient(SUPABASE_URL, SUPABASE_KEY);
            const { data } = await sb
              .from("locations")
              .select("slug,updated_at")
              .eq("is_active", true);
            locationSlugs = (data as { slug: string; updated_at: string }[] | null) ?? [];
          } catch {
            // ignore — return static routes only
          }
        }

        const today = new Date().toISOString().slice(0, 10);
        const staticPaths = ["/", "/about", "/locations", "/menus", "/gallery", "/contact"];
        const urls = [
          ...staticPaths.map((p) => ({ loc: `${origin}${p}`, lastmod: today })),
          ...locationSlugs.map((l) => ({ loc: `${origin}/locations/${l.slug}`, lastmod: (l.updated_at ?? "").slice(0, 10) || today })),
        ];

        const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls.map((u) => `  <url><loc>${u.loc}</loc><lastmod>${u.lastmod}</lastmod></url>`).join("\n")}
</urlset>`;

        return new Response(xml, {
          headers: {
            "Content-Type": "application/xml; charset=utf-8",
            "Cache-Control": "public, max-age=3600",
          },
        });
      },
    },
  },
});
