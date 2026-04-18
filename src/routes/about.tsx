import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { PublicLayout } from "@/components/site/PublicLayout";
import { supabase } from "@/integrations/supabase/client";
import aboutFamily from "@/assets/about-family.jpg";

export const Route = createFileRoute("/about")({
  head: () => ({
    meta: [
      { title: "About — Reginè Pizzeria" },
      { name: "description", content: "Our family story — Southern Italian roots, brought to London with warmth, heritage and quality ingredients." },
      { property: "og:title", content: "About — Reginè Pizzeria" },
      { property: "og:description", content: "A Southern Italian family in London — our story, our philosophy, our pizza." },
      { property: "og:image", content: aboutFamily },
    ],
  }),
  component: AboutPage,
});

type About = { headline: string | null; intro: string | null; story: string | null; image_urls: string[] | null };

function AboutPage() {
  const [about, setAbout] = useState<About | null>(null);
  useEffect(() => {
    supabase.from("about_content").select("headline,intro,story,image_urls").eq("id", 1).maybeSingle().then(({ data }) => setAbout(data as About | null));
  }, []);
  const images: string[] = (about?.image_urls && about.image_urls.length ? about.image_urls : [aboutFamily]) as string[];
  return (
    <PublicLayout>
      <section className="bg-motif">
        <div className="mx-auto max-w-4xl px-4 py-20 text-center sm:px-6 lg:px-8 lg:py-28">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-primary">Our story</p>
          <h1 className="mt-4 font-serif text-4xl font-semibold leading-tight sm:text-5xl text-balance">
            {about?.headline ?? "A Southern Italian family, at home in London"}
          </h1>
          {about?.intro && <p className="mx-auto mt-6 max-w-2xl text-lg text-muted-foreground text-pretty">{about.intro}</p>}
        </div>
      </section>

      <section>
        <div className="mx-auto grid max-w-6xl items-start gap-12 px-4 pb-20 sm:px-6 lg:grid-cols-5 lg:px-8">
          <div className="lg:col-span-2 space-y-4">
            {images.slice(0, 2).map((src, i) => (
              <img key={i} src={src} alt="" className="w-full rounded-2xl object-cover shadow-md aspect-[4/5]" loading="lazy" />
            ))}
          </div>
          <div className="lg:col-span-3 prose prose-neutral max-w-none">
            <article className="space-y-5 text-base leading-relaxed text-foreground/90">
              {(about?.story ?? "").split(/\n\n+/).map((p, i) => <p key={i} className="text-pretty">{p}</p>)}
            </article>
            <div className="mt-10 grid gap-6 sm:grid-cols-3">
              {[
                { t: "Family-led", d: "Run by the family that built it." },
                { t: "Simple ingredients", d: "Italian flour, San Marzano, good olive oil." },
                { t: "Proper hospitality", d: "Every guest is treated like family." },
              ].map((c) => (
                <div key={c.t} className="rounded-xl border border-border bg-card p-5">
                  <h3 className="font-serif text-lg text-primary">{c.t}</h3>
                  <p className="mt-2 text-sm text-muted-foreground">{c.d}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>
    </PublicLayout>
  );
}
