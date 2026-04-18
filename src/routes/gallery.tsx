import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { X } from "lucide-react";
import { PublicLayout } from "@/components/site/PublicLayout";
import { supabase } from "@/integrations/supabase/client";
import g1 from "@/assets/gallery-1.jpg";
import g2 from "@/assets/gallery-2.jpg";
import g3 from "@/assets/gallery-3.jpg";
import g4 from "@/assets/gallery-4.jpg";

export const Route = createFileRoute("/gallery")({
  head: () => ({
    meta: [
      { title: "Gallery — Reginè Pizzeria" },
      { name: "description", content: "A look inside Reginè Pizzeria — pizza, ingredients, our kitchen and our spaces." },
      { property: "og:title", content: "Gallery — Reginè Pizzeria" },
      { property: "og:description", content: "A look inside Reginè Pizzeria." },
    ],
  }),
  component: GalleryPage,
});

type Img = { id: string; image_url: string; alt_text: string | null; caption: string | null };

const FALLBACK: Img[] = [
  { id: "f1", image_url: g1, alt_text: "Tomatoes and basil", caption: "Simple ingredients" },
  { id: "f2", image_url: g2, alt_text: "Pizza dough being stretched", caption: "Hand-stretched dough" },
  { id: "f3", image_url: g3, alt_text: "Wood-fired oven", caption: "Wood-fired" },
  { id: "f4", image_url: g4, alt_text: "Antipasti board", caption: "Antipasti" },
];

function GalleryPage() {
  const [images, setImages] = useState<Img[]>([]);
  const [active, setActive] = useState<Img | null>(null);
  useEffect(() => {
    supabase.from("gallery_images").select("id,image_url,alt_text,caption").eq("is_active", true).order("display_order").then(({ data }) => {
      const list = (data as Img[] | null) ?? [];
      setImages(list.length > 0 ? list : FALLBACK);
    });
  }, []);

  return (
    <PublicLayout>
      <section className="bg-motif">
        <div className="mx-auto max-w-4xl px-4 py-20 text-center sm:px-6 lg:px-8">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-primary">Gallery</p>
          <h1 className="mt-4 font-serif text-4xl font-semibold sm:text-5xl text-balance">Inside Reginè</h1>
          <p className="mx-auto mt-5 max-w-xl text-muted-foreground">A glimpse of our kitchen, our pizza and the people who make it.</p>
        </div>
      </section>
      <section>
        <div className="mx-auto max-w-7xl px-4 pb-24 sm:px-6 lg:px-8">
          <div className="gallery-cols">
            {images.map((img) => (
              <button key={img.id} onClick={() => setActive(img)} className="block w-full overflow-hidden rounded-xl border border-border bg-card text-left">
                <img src={img.image_url} alt={img.alt_text ?? img.caption ?? "Reginè gallery"} className="w-full object-cover transition-transform hover:scale-[1.02]" loading="lazy" />
                {img.caption && <p className="px-3 py-2 text-xs text-muted-foreground">{img.caption}</p>}
              </button>
            ))}
          </div>
        </div>
      </section>
      {active && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-brand-charcoal/90 p-4" onClick={() => setActive(null)}>
          <button className="absolute right-4 top-4 rounded-full bg-brand-cream/10 p-2 text-brand-cream hover:bg-brand-cream/20" aria-label="Close"><X className="h-5 w-5" /></button>
          <img src={active.image_url} alt={active.alt_text ?? "Gallery image"} className="max-h-[88vh] max-w-full rounded-xl object-contain" />
        </div>
      )}
    </PublicLayout>
  );
}
