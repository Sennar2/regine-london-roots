import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Phone, Mail, MapPin, ExternalLink, Clock, ArrowLeft, ShoppingBag } from "lucide-react";
import { PublicLayout } from "@/components/site/PublicLayout";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import locationFallback from "@/assets/location-wandsworth.jpg";

type Loc = {
  id: string; name: string; slug: string; area: string | null; address: string | null; postcode: string | null;
  phone: string | null; email: string | null; description: string | null; full_description: string | null; hero_image_url: string | null;
  hero_eyebrow: string | null; hero_title: string | null; hero_subtitle: string | null;
  hero_cta_label: string | null; hero_cta_href: string | null;
  gallery_image_urls: string[] | null; opening_hours: { day: string; hours: string }[] | null;
  maps_link: string | null; booking_link: string | null;
  deliveroo_url: string | null; justeat_url: string | null; ubereats_url: string | null; click_collect_url: string | null;
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
    const meta: Array<Record<string, string>> = [
      { title },
      { name: "description", content: desc },
      { property: "og:title", content: title },
      { property: "og:description", content: desc },
    ];
    if (l?.hero_image_url) {
      meta.push({ property: "og:image", content: l.hero_image_url });
      meta.push({ name: "twitter:image", content: l.hero_image_url });
    }
    const scripts = l ? [{
      type: "application/ld+json",
      children: JSON.stringify({
        "@context": "https://schema.org",
        "@type": "Restaurant",
        name: l.name,
        servesCuisine: ["Italian", "Pizza", "Southern Italian"],
        image: l.hero_image_url ?? undefined,
        telephone: l.phone ?? undefined,
        email: l.email ?? undefined,
        url: typeof window !== "undefined" ? window.location.href : undefined,
        address: l.address ? {
          "@type": "PostalAddress",
          streetAddress: l.address,
          postalCode: l.postcode ?? undefined,
          addressLocality: l.area ?? "London",
          addressCountry: "GB",
        } : undefined,
        openingHours: (l.opening_hours ?? []).map((h) => `${h.day} ${h.hours}`),
      }),
    }] : undefined;
    return { meta, scripts };
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

  const orderLinks = [
    { label: "Order on Deliveroo", url: l.deliveroo_url },
    { label: "Order on Just Eat", url: l.justeat_url },
    { label: "Order on Uber Eats", url: l.ubereats_url },
    { label: "Click & Collect", url: l.click_collect_url },
  ].filter((x): x is { label: string; url: string } => !!x.url);

  const heroTitle = l.hero_title ?? l.name;
  const heroEyebrow = l.hero_eyebrow ?? l.area ?? "London";
  const heroSubtitle = l.hero_subtitle ?? (l.address ? `${l.address}${l.postcode ? `, ${l.postcode}` : ""}` : null);

  return (
    <PublicLayout>
      <section className="bg-brand-cream">
        <div className="mx-auto grid max-w-7xl gap-10 px-4 py-12 sm:px-6 lg:grid-cols-2 lg:items-center lg:gap-16 lg:py-20 lg:px-8">
          <div className="order-2 lg:order-1">
            <Link to="/locations" className="mb-6 inline-flex items-center gap-2 text-sm text-brand-charcoal/70 hover:text-brand-charcoal"><ArrowLeft className="h-4 w-4" /> All locations</Link>
            <p className="text-xs font-semibold uppercase tracking-[0.25em] text-brand-gold">{heroEyebrow}</p>
            <h1 className="mt-3 font-serif text-4xl font-semibold leading-[1.05] text-brand-charcoal text-balance sm:text-5xl lg:text-6xl">{heroTitle}</h1>
            {heroSubtitle && <p className="mt-5 max-w-xl text-base text-brand-charcoal/70 sm:text-lg">{heroSubtitle}</p>}
            <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
              <Button asChild className="w-full sm:w-auto"><Link to="/menus">View menu</Link></Button>
              {l.maps_link && <Button asChild variant="outline" className="w-full sm:w-auto"><a href={l.maps_link} target="_blank" rel="noreferrer">Get directions <ExternalLink className="ml-1 h-4 w-4" /></a></Button>}
              {l.booking_link && <Button asChild variant="gold" className="w-full sm:w-auto"><a href={l.booking_link} target="_blank" rel="noreferrer">Book a table</a></Button>}
              {l.hero_cta_label && l.hero_cta_href && <Button asChild variant="secondary" className="w-full sm:w-auto"><a href={l.hero_cta_href} target="_blank" rel="noreferrer">{l.hero_cta_label} <ExternalLink className="ml-1 h-4 w-4" /></a></Button>}
            </div>
          </div>
          <div className="order-1 lg:order-2">
            <div className="relative">
              <div className="absolute -inset-3 -z-10 rounded-[2rem] bg-brand-terracotta/15 sm:-inset-4" aria-hidden />
              <div className="aspect-[4/3] overflow-hidden rounded-2xl shadow-xl sm:aspect-[5/4]">
                <img src={hero} alt={`${l.name} interior`} className="h-full w-full object-cover" />
              </div>
            </div>
          </div>
        </div>
      </section>

      <section>
        <div className="mx-auto grid max-w-6xl gap-12 px-4 py-16 sm:px-6 lg:grid-cols-3 lg:px-8">
          <div className="space-y-8 lg:col-span-2">
            {(l.full_description || l.description) && (
              <div className="space-y-4 text-lg leading-relaxed text-foreground/90 text-pretty">
                {(l.full_description ?? l.description ?? "").split(/\n\n+/).map((p: string, i: number) => (
                  <p key={i}>{p}</p>
                ))}
              </div>
            )}

            {orderLinks.length > 0 && (
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-primary">Order online</p>
                <h2 className="mt-2 font-serif text-2xl">Reginè to your door</h2>
                <div className="mt-5 grid gap-3 sm:grid-cols-2">
                  {orderLinks.map((o) => (
                    <a
                      key={o.label}
                      href={o.url}
                      target="_blank"
                      rel="noreferrer"
                      className="group flex items-center justify-between rounded-xl border border-border bg-card px-5 py-4 transition hover:border-primary/40 hover:shadow-sm"
                    >
                      <span className="flex items-center gap-3 font-medium text-foreground">
                        <ShoppingBag className="h-4 w-4 text-primary" />
                        {o.label}
                      </span>
                      <ExternalLink className="h-4 w-4 text-muted-foreground group-hover:text-primary" />
                    </a>
                  ))}
                </div>
              </div>
            )}

            {menus.length > 0 && (
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-primary">Menus</p>
                <h2 className="mt-2 font-serif text-2xl">Have a look</h2>
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
            {(l.opening_hours ?? []).length > 0 && (
              <div className="rounded-2xl border border-border bg-card p-6">
                <h3 className="flex items-center gap-2 font-serif text-xl"><Clock className="h-4 w-4 text-primary" /> Opening hours</h3>
                <ul className="mt-4 divide-y divide-border text-sm">
                  {((l.opening_hours ?? []) as { day: string; hours: string }[]).map((h) => (
                    <li key={h.day} className="flex justify-between py-2"><span className="text-muted-foreground">{h.day}</span><span className="font-medium">{h.hours}</span></li>
                  ))}
                </ul>
              </div>
            )}
            <div className="rounded-2xl border border-border bg-card p-6 space-y-3">
              <h3 className="font-serif text-xl">Contact</h3>
              {l.phone && <a href={`tel:${l.phone}`} className="flex items-center gap-2 text-sm hover:text-primary"><Phone className="h-4 w-4 text-primary" /> {l.phone}</a>}
              {l.email && <a href={`mailto:${l.email}`} className="flex items-center gap-2 text-sm hover:text-primary"><Mail className="h-4 w-4 text-primary" /> {l.email}</a>}
              {l.address && <p className="flex items-start gap-2 text-sm"><MapPin className="mt-0.5 h-4 w-4 text-primary" /> <span>{l.address}{l.postcode ? `, ${l.postcode}` : ""}</span></p>}
              {l.maps_link && (
                <Button asChild variant="outline" size="sm" className="mt-2 w-full">
                  <a href={l.maps_link} target="_blank" rel="noreferrer">Open in Maps <ExternalLink className="ml-1 h-3.5 w-3.5" /></a>
                </Button>
              )}
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
