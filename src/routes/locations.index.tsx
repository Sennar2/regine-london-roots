import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { MapPin, ArrowRight } from "lucide-react";
import { PublicLayout } from "@/components/site/PublicLayout";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/locations/")({
  head: () => ({
    meta: [
      { title: "Locations — Reginè Pizzeria London" },
      { name: "description", content: "Find your nearest Reginè Pizzeria in London — addresses, opening hours and contact details." },
      { property: "og:title", content: "Reginè Pizzeria — Locations" },
      { property: "og:description", content: "All Reginè Pizzeria locations across London." },
    ],
  }),
  component: LocationsPage,
});

type Loc = { id: string; name: string; slug: string; area: string | null; address: string | null; hero_image_url: string | null; description: string | null; phone: string | null };

function LocationsPage() {
  const [locs, setLocs] = useState<Loc[]>([]);
  useEffect(() => {
    supabase.from("locations").select("id,name,slug,area,address,hero_image_url,description,phone").eq("is_active", true).order("display_order").then(({ data }) => setLocs((data as Loc[] | null) ?? []));
  }, []);
  return (
    <PublicLayout>
      <section className="bg-motif">
        <div className="mx-auto max-w-4xl px-4 py-20 text-center sm:px-6 lg:px-8">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-primary">Visit us</p>
          <h1 className="mt-4 font-serif text-4xl font-semibold sm:text-5xl text-balance">Our London Pizzerias</h1>
          <p className="mx-auto mt-5 max-w-xl text-muted-foreground">Drop in for a slice, a long lunch, or a family dinner. We can't wait to welcome you.</p>
        </div>
      </section>
      <section>
        <div className="mx-auto grid max-w-7xl gap-8 px-4 pb-24 sm:px-6 md:grid-cols-2 lg:grid-cols-3 lg:px-8">
          {locs.length === 0 && (
            <p className="col-span-full text-center text-muted-foreground">No locations yet.</p>
          )}
          {locs.map((l) => (
            <Link key={l.id} to="/locations/$slug" params={{ slug: l.slug }} className="group overflow-hidden rounded-2xl border border-border bg-card transition-all hover:-translate-y-1 hover:shadow-xl">
              <div className="aspect-[4/3] overflow-hidden bg-muted">
                {l.hero_image_url ? (
                  <img src={l.hero_image_url} alt={l.name} className="h-full w-full object-cover transition-transform group-hover:scale-105" loading="lazy" />
                ) : (
                  <div className="flex h-full w-full items-center justify-center text-muted-foreground"><MapPin className="h-10 w-10" /></div>
                )}
              </div>
              <div className="p-6">
                <p className="text-xs uppercase tracking-wider text-brand-terracotta">{l.area ?? "London"}</p>
                <h2 className="mt-1 font-serif text-2xl">{l.name}</h2>
                {l.address && <p className="mt-2 text-sm text-muted-foreground">{l.address}</p>}
                <span className="mt-4 inline-flex items-center gap-1 text-sm font-medium text-primary">View details <ArrowRight className="h-4 w-4" /></span>
              </div>
            </Link>
          ))}
        </div>
      </section>
    </PublicLayout>
  );
}
