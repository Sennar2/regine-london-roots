import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { ArrowRight, MapPin, UtensilsCrossed } from "lucide-react";
import { PublicLayout } from "@/components/site/PublicLayout";
import { Button } from "@/components/ui/button";
import heroPizza from "@/assets/hero-pizza.jpg";
import aboutFamily from "@/assets/about-family.jpg";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Reginè Pizzeria — Southern Italian pizza in London" },
      { name: "description", content: "A Southern Italian family pizzeria in London. Wood-fired pizza, antipasti and proper hospitality, starting in Wandsworth." },
      { property: "og:title", content: "Reginè Pizzeria — Southern Italian pizza in London" },
      { property: "og:description", content: "A Southern Italian family pizzeria in London. Wood-fired pizza, antipasti and proper hospitality." },
      { property: "og:image", content: heroPizza },
      { name: "twitter:image", content: heroPizza },
    ],
  }),
  component: HomePage,
});

type LocCard = { id: string; name: string; slug: string; area: string | null; hero_image_url: string | null; description: string | null };
type GalleryItem = { id: string; image_url: string; alt_text: string | null; caption: string | null };

function HomePage() {
  const [locations, setLocations] = useState<LocCard[]>([]);
  const [gallery, setGallery] = useState<GalleryItem[]>([]);
  const [tagline, setTagline] = useState<string>("Southern Italian warmth, served in London.");

  useEffect(() => {
    supabase.from("locations").select("id,name,slug,area,hero_image_url,description").eq("is_active", true).order("display_order").then(({ data }) => setLocations((data as LocCard[] | null) ?? []));
    supabase.from("gallery_images").select("id,image_url,alt_text,caption").eq("is_active", true).eq("is_featured", true).order("display_order").limit(6).then(({ data }) => setGallery((data as GalleryItem[] | null) ?? []));
    supabase.from("site_settings").select("brand_tagline").eq("id", 1).maybeSingle().then(({ data }) => { if (data?.brand_tagline) setTagline(data.brand_tagline); });
  }, []);

  return (
    <PublicLayout>
      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 -z-10">
          <img src={heroPizza} alt="" className="h-full w-full object-cover opacity-90" width={1600} height={1200} />
          <div className="absolute inset-0 bg-gradient-to-b from-brand-charcoal/30 via-brand-charcoal/40 to-brand-charcoal/85" />
        </div>
        <div className="mx-auto flex min-h-[78vh] max-w-7xl flex-col justify-end px-4 pb-16 pt-28 text-brand-cream sm:px-6 lg:px-8">
          <p className="mb-4 inline-flex items-center gap-2 text-xs font-medium uppercase tracking-[0.2em] text-brand-gold">
            <span className="h-px w-8 bg-brand-gold" /> Family pizzeria · London
          </p>
          <h1 className="font-serif text-4xl font-semibold leading-[1.05] text-balance sm:text-6xl md:text-7xl">
            {tagline}
          </h1>
          <p className="mt-6 max-w-xl text-base text-brand-cream/85 sm:text-lg text-pretty">
            A neighbourhood pizzeria with Southern Italian roots. Hand-stretched dough, simple ingredients, and a welcome that feels like home.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Button asChild size="lg" className="bg-primary text-primary-foreground hover:bg-primary/90">
              <Link to="/menus">View Menus <ArrowRight className="ml-2 h-4 w-4" /></Link>
            </Button>
            <Button asChild size="lg" variant="outline" className="border-brand-cream/40 bg-transparent text-brand-cream hover:bg-brand-cream/10 hover:text-brand-cream">
              <Link to="/locations">Find Us</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Intro */}
      <section className="bg-motif">
        <div className="mx-auto grid max-w-7xl items-center gap-12 px-4 py-20 sm:px-6 lg:grid-cols-2 lg:px-8 lg:py-28">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-primary">Our family</p>
            <h2 className="mt-3 font-serif text-3xl font-semibold leading-tight text-foreground sm:text-4xl text-balance">
              Recipes from the South. A welcome from the heart.
            </h2>
            <p className="mt-5 text-base leading-relaxed text-muted-foreground text-pretty">
              Reginè was born from long Sunday lunches and the smell of tomato, basil and wood-fired crust. We brought that warmth to London — and built a small pizzeria around it. Every guest is family. Every plate is made the way our grandmothers would expect.
            </p>
            <div className="mt-7">
              <Button asChild variant="outline" className="border-primary/30 text-primary hover:bg-primary/10 hover:text-primary">
                <Link to="/about">Read our story <ArrowRight className="ml-2 h-4 w-4" /></Link>
              </Button>
            </div>
          </div>
          <div className="relative">
            <div className="absolute -inset-3 rounded-3xl bg-brand-terracotta/15 -z-10" />
            <img src={aboutFamily} alt="Hands kneading dough in the Reginè kitchen" className="aspect-[4/3] w-full rounded-2xl object-cover shadow-xl" loading="lazy" width={1400} height={1000} />
          </div>
        </div>
      </section>

      {/* Locations preview */}
      <section className="bg-secondary/40">
        <div className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
          <div className="mb-10 flex items-end justify-between gap-6">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-primary">Our locations</p>
              <h2 className="mt-3 font-serif text-3xl font-semibold sm:text-4xl">Find your nearest Reginè</h2>
            </div>
            <Link to="/locations" className="hidden text-sm font-medium text-primary hover:underline sm:inline">All locations →</Link>
          </div>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {locations.map((l) => (
              <Link key={l.id} to="/locations/$slug" params={{ slug: l.slug }} className="group overflow-hidden rounded-2xl border border-border bg-card transition-all hover:-translate-y-1 hover:shadow-xl">
                <div className="aspect-[4/3] w-full overflow-hidden bg-muted">
                  {l.hero_image_url ? (
                    <img src={l.hero_image_url} alt={l.name} className="h-full w-full object-cover transition-transform group-hover:scale-105" loading="lazy" />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center bg-muted text-muted-foreground"><MapPin className="h-10 w-10" /></div>
                  )}
                </div>
                <div className="p-5">
                  <p className="text-xs uppercase tracking-wider text-brand-terracotta">{l.area ?? "London"}</p>
                  <h3 className="mt-1 font-serif text-2xl text-foreground">{l.name}</h3>
                  {l.description && <p className="mt-2 line-clamp-2 text-sm text-muted-foreground">{l.description}</p>}
                  <span className="mt-4 inline-flex items-center gap-1 text-sm font-medium text-primary">View location <ArrowRight className="h-4 w-4" /></span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Menu CTA strip */}
      <section className="bg-brand-charcoal text-brand-cream">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-6 px-4 py-14 text-center sm:px-6 md:flex-row md:text-left lg:px-8">
          <div>
            <h2 className="font-serif text-3xl font-semibold sm:text-4xl">The menu, the way nonna made it.</h2>
            <p className="mt-2 max-w-xl text-brand-cream/80">Wood-fired pizzas, antipasti, dolci and a short list of well-chosen wines.</p>
          </div>
          <Button asChild size="lg" className="bg-brand-gold text-brand-charcoal hover:bg-brand-gold/90">
            <Link to="/menus"><UtensilsCrossed className="mr-2 h-4 w-4" /> View Menus</Link>
          </Button>
        </div>
      </section>

      {/* Gallery preview */}
      {gallery.length > 0 && (
        <section className="bg-background">
          <div className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
            <div className="mb-10 flex items-end justify-between gap-6">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-primary">Gallery</p>
                <h2 className="mt-3 font-serif text-3xl font-semibold sm:text-4xl">A taste of Reginè</h2>
              </div>
              <Link to="/gallery" className="text-sm font-medium text-primary hover:underline">See all →</Link>
            </div>
            <div className="grid grid-cols-2 gap-3 md:grid-cols-3">
              {gallery.map((g, i) => (
                <img key={g.id} src={g.image_url} alt={g.alt_text ?? g.caption ?? "Gallery image"} className={`w-full rounded-xl object-cover ${i % 5 === 0 ? "row-span-2 aspect-[3/4]" : "aspect-square"}`} loading="lazy" />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Contact CTA */}
      <section className="bg-secondary/40">
        <div className="mx-auto max-w-3xl px-4 py-20 text-center sm:px-6 lg:px-8">
          <h2 className="font-serif text-3xl font-semibold sm:text-4xl text-balance">Come and see us.</h2>
          <p className="mt-4 text-muted-foreground">Booking enquiries, private events, or just to say ciao — we'd love to hear from you.</p>
          <div className="mt-8 flex flex-wrap justify-center gap-3">
            <Button asChild className="bg-primary text-primary-foreground"><Link to="/contact">Get in touch</Link></Button>
            <Button asChild variant="outline" className="border-primary/30 text-primary hover:bg-primary/10 hover:text-primary"><Link to="/locations">Find us</Link></Button>
          </div>
        </div>
      </section>
    </PublicLayout>
  );
}
