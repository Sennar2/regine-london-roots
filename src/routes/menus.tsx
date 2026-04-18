import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { ExternalLink, FileText } from "lucide-react";
import { PublicLayout } from "@/components/site/PublicLayout";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/menus")({
  head: () => ({
    meta: [
      { title: "Menus — Reginè Pizzeria" },
      { name: "description", content: "Browse our pizza, antipasti, drinks and seasonal menus." },
      { property: "og:title", content: "Menus — Reginè Pizzeria" },
      { property: "og:description", content: "Wood-fired pizza, antipasti, drinks and seasonal menus at Reginè." },
    ],
  }),
  component: MenusPage,
});

type Menu = { id: string; title: string; description: string | null; category: string | null; pdf_url: string | null; external_url: string | null; is_featured: boolean };

function MenusPage() {
  const [menus, setMenus] = useState<Menu[]>([]);
  useEffect(() => {
    supabase.from("menus").select("id,title,description,category,pdf_url,external_url,is_featured").eq("is_active", true).order("display_order").then(({ data }) => setMenus((data as Menu[] | null) ?? []));
  }, []);
  const groups = menus.reduce<Record<string, Menu[]>>((acc, m) => {
    const k = m.category ?? "Menu";
    (acc[k] ||= []).push(m);
    return acc;
  }, {});

  return (
    <PublicLayout>
      <section className="bg-motif">
        <div className="mx-auto max-w-4xl px-4 py-20 text-center sm:px-6 lg:px-8">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-primary">Eat & drink</p>
          <h1 className="mt-4 font-serif text-4xl font-semibold sm:text-5xl text-balance">Our Menus</h1>
          <p className="mx-auto mt-5 max-w-xl text-muted-foreground">Wood-fired pizza, antipasti, dolci and a short list of well-chosen wines.</p>
        </div>
      </section>
      <section>
        <div className="mx-auto max-w-5xl space-y-12 px-4 pb-24 sm:px-6 lg:px-8">
          {Object.keys(groups).length === 0 && (
            <p className="text-center text-muted-foreground">Menus coming soon.</p>
          )}
          {Object.entries(groups).map(([cat, items]) => (
            <div key={cat}>
              <h2 className="font-serif text-2xl text-primary">{cat}</h2>
              <div className="mt-4 grid gap-4 sm:grid-cols-2">
                {items.map((m) => {
                  const url = m.pdf_url ?? m.external_url;
                  return (
                    <div key={m.id} className="rounded-2xl border border-border bg-card p-6">
                      <div className="flex items-start justify-between gap-4">
                        <div>
                          <h3 className="font-serif text-xl">{m.title}</h3>
                          {m.description && <p className="mt-1 text-sm text-muted-foreground">{m.description}</p>}
                        </div>
                        {m.is_featured && <span className="rounded-full bg-brand-gold/20 px-2 py-1 text-[10px] font-medium uppercase tracking-wider text-brand-charcoal">Featured</span>}
                      </div>
                      {url && (
                        <a href={url} target="_blank" rel="noreferrer" className="mt-4 inline-flex items-center gap-2 rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90">
                          {m.pdf_url ? <FileText className="h-4 w-4" /> : <ExternalLink className="h-4 w-4" />} Open
                        </a>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </section>
    </PublicLayout>
  );
}
