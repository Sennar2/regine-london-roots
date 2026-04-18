import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Phone, Mail, MapPin, ExternalLink, Clock, ArrowLeft } from "lucide-react";
import { PublicLayout } from "@/components/site/PublicLayout";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import locationFallback from "@/assets/location-wandsworth.jpg";

type Loc = {
  id: string; name: string; slug: string; area: string | null; address: string | null; postcode: string | null;
  phone: string | null; email: string | null; description: string | null; hero_image_url: string | null;
  gallery_image_urls: string[] | null; opening_hours: { day: string; hours: string }[] | null;
  maps_link: string | null; booking_link: string | null;
};

export const Route = createFileRoute("/locations/$slug")({
  loader: async ({ params }) => {
    const { data } = await supabase.from("locations").select("*").eq("slug", params.slug).eq("is_active", true).maybeSingle();
    if (!data) throw notFound();
    return { location: data as Loc };
  },
  head: ({ loaderData }) => {
    const l = loaderData?.location;
    const title = l ? `${l.name} — Southern Italian pizza in ${l.area ?? "London"}` : "Location — Reginè Pizzeria";
    const desc = l?.description ?? `Visit ${l?.name ?? "Reginè Pizzeria"} in London for authentic Southern Italian pizza.`;
    return {
      meta: [
        { title },
        { name: "description", content: desc },
        { property: "og:title", content: title },
        { property: "og:description", content: desc },
        ...(l?.hero_image_url ? [{ property: "og:image", content: l.hero_image_url }] : []),
      ],
    };
  },
  notFoundComponent: () => (
    <PublicLayout>
      <div className="mx-auto max-w-xl px-4 py-24 text-center">
        <h1 className="font-serif text-4xl">Location not found</h1>
        <p className="mt-3 text-muted-foreground">We couldn't find that pizzeria.</p>
        <Button asChild className="mt-6"><Link to="/locations">All locations</Link></Button>
      </div>
    </PublicLayout>
  ),
  errorComponent: ({ error }) => (
    <PublicLayout>
      <div className="mx-auto max-w-xl px-4 py-24 text-center">
        <h1 className="font-serif text-3xl">Something went wrong</h1>
        <p className="mt-3 text-sm text-muted-foreground">{error.message}</p>
      </div>
    </PublicLayout>
  ),
  component: LocationDetail,
});

type Menu = { id: string; title: string; pdf_url: string | null; external_url: string | null; category: string | null };

function LocationDetail() {
  const { location: l } = Route.useLoaderData();
  const hero = l.hero_image_url ?? locationFallback;
  const [menus, setMenus] = useState<Menu[]>([]);
  useEffect(() => {
    supabase.from("menus").select("id,title,pdf_url,external_url,category").eq("is_active", true).or(`location_id.eq.${l.id},location_id.is.null`).order("display_order").then(({ data }) => setMenus((data as Menu[] | null) ?? []));
  }, [l.id]);

  return (
    <PublicLayout>
      <section className="relative">
        <div className="absolute inset-0 -z-10">
          <img src={hero} alt="" className="h-full w-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-b from-brand-charcoal/30 to-brand-charcoal/85" />
        </div>
        <div className="mx-auto flex min-h-[55vh] max-w-7xl flex-col justify-end px-4 py-16 text-brand-cream sm:px-6 lg:px-8">
          <Link to="/locations" className="mb-6 inline-flex items-center gap-2 text-sm text-brand-cream/80 hover:text-brand-cream"><ArrowLeft className="h-4 w-4" /> All locations</Link>
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-brand-gold">{l.area ?? "London"}</p>
          <h1 className="mt-3 font-serif text-4xl font-semibold sm:text-6xl text-balance">{l.name}</h1>
          {l.address && <p className="mt-4 max-w-xl text-brand-cream/85">{l.address}{l.postcode ? `, ${l.postcode}` : ""}</p>}
          <div className="mt-8 flex flex-wrap gap-3">
            <Button asChild className="bg-primary text-primary-foreground"><Link to="/menus">View menu</Link></Button>
            {l.maps_link && <Button asChild variant="outline" className="border-brand-cream/40 bg-transparent text-brand-cream hover:bg-brand-cream/10 hover:text-brand-cream"><a href={l.maps_link} target="_blank" rel="noreferrer">Get directions <ExternalLink className="ml-2 h-4 w-4" /></a></Button>}
            {l.booking_link && <Button asChild className="bg-brand-gold text-brand-charcoal hover:bg-brand-gold/90"><a href={l.booking_link} target="_blank" rel="noreferrer">Book a table</a></Button>}
          </div>
        </div>
      </section>

      <section>
        <div className="mx-auto grid max-w-6xl gap-12 px-4 py-16 sm:px-6 lg:grid-cols-3 lg:px-8">
          <div className="space-y-6 lg:col-span-2">
            {l.description && <p className="text-lg leading-relaxed text-foreground/90 text-pretty">{l.description}</p>}
            {menus.length > 0 && (
              <div>
                <h2 className="font-serif text-2xl">Menus</h2>
                <ul className="mt-4 space-y-2">
                  {menus.map((m) => {
                    const url = m.pdf_url ?? m.external_url;
                    if (!url) return null;
                    return (
                      <li key={m.id}>
                        <a href={url} target="_blank" rel="noreferrer" className="flex items-center justify-between rounded-lg border border-border bg-card px-4 py-3 hover:border-primary/40">
                          <span><span className="font-medium">{m.title}</span> {m.category && <span className="ml-2 text-xs text-muted-foreground">· {m.category}</span>}</span>
                          <ExternalLink className="h-4 w-4 text-primary" />
                        </a>
                      </li>
                    );
                  })}
                </ul>
              </div>
            )}
          </div>
          <aside className="space-y-6">
            <div className="rounded-2xl border border-border bg-card p-6">
              <h3 className="flex items-center gap-2 font-serif text-xl"><Clock className="h-4 w-4 text-primary" /> Opening hours</h3>
              <ul className="mt-4 divide-y divide-border text-sm">
                {((l.opening_hours ?? []) as { day: string; hours: string }[]).map((h) => (
                  <li key={h.day} className="flex justify-between py-2"><span className="text-muted-foreground">{h.day}</span><span>{h.hours}</span></li>
                ))}
              </ul>
            </div>
            <div className="rounded-2xl border border-border bg-card p-6 space-y-3">
              <h3 className="font-serif text-xl">Contact</h3>
              {l.phone && <a href={`tel:${l.phone}`} className="flex items-center gap-2 text-sm hover:text-primary"><Phone className="h-4 w-4 text-primary" /> {l.phone}</a>}
              {l.email && <a href={`mailto:${l.email}`} className="flex items-center gap-2 text-sm hover:text-primary"><Mail className="h-4 w-4 text-primary" /> {l.email}</a>}
              {l.address && <p className="flex items-start gap-2 text-sm"><MapPin className="mt-0.5 h-4 w-4 text-primary" /> <span>{l.address}{l.postcode ? `, ${l.postcode}` : ""}</span></p>}
            </div>
          </aside>
        </div>
      </section>

      {l.gallery_image_urls && l.gallery_image_urls.length > 0 && (
        <section className="bg-secondary/40">
          <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
            <h2 className="font-serif text-3xl">Inside {l.name}</h2>
            <div className="gallery-cols mt-8">
              {(l.gallery_image_urls as string[]).map((url: string, i: number) => (
                <img key={i} src={url} alt={`${l.name} interior ${i + 1}`} className="w-full rounded-xl object-cover" loading="lazy" />
              ))}
            </div>
          </div>
        </section>
      )}
    </PublicLayout>
  );
}
