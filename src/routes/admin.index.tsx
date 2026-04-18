import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { MapPin, UtensilsCrossed, FileText, Image, Mail } from "lucide-react";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/admin/")({
  head: () => ({ meta: [{ title: "Dashboard — Reginè Admin" }, { name: "robots", content: "noindex,nofollow" }] }),
  component: AdminDashboard,
});

type Counts = { locations: number; menus: number; files: number; gallery: number; messages: number };

function AdminDashboard() {
  const [counts, setCounts] = useState<Counts>({ locations: 0, menus: 0, files: 0, gallery: 0, messages: 0 });
  useEffect(() => {
    (async () => {
      const tables = ["locations", "menus", "files", "gallery_images", "contact_messages"] as const;
      const results = await Promise.all(tables.map((t) => supabase.from(t).select("*", { count: "exact", head: true })));
      setCounts({
        locations: results[0].count ?? 0,
        menus: results[1].count ?? 0,
        files: results[2].count ?? 0,
        gallery: results[3].count ?? 0,
        messages: results[4].count ?? 0,
      });
    })();
  }, []);

  const cards = [
    { label: "Locations", value: counts.locations, icon: MapPin, to: "/admin/locations" },
    { label: "Menus", value: counts.menus, icon: UtensilsCrossed, to: "/admin/menus" },
    { label: "Files", value: counts.files, icon: FileText, to: "/admin/files" },
    { label: "Gallery", value: counts.gallery, icon: Image, to: "/admin/gallery" },
    { label: "Messages", value: counts.messages, icon: Mail, to: "/admin/messages" },
  ] as const;

  return (
    <AdminLayout>
      <h1 className="font-serif text-3xl">Welcome back</h1>
      <p className="mt-1 text-sm text-muted-foreground">Manage your locations, menus, photos and content.</p>
      <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
        {cards.map((c) => (
          <Link key={c.label} to={c.to} className="rounded-2xl border border-border bg-card p-5 transition hover:-translate-y-0.5 hover:shadow-md">
            <c.icon className="h-5 w-5 text-primary" />
            <p className="mt-3 text-3xl font-serif">{c.value}</p>
            <p className="text-sm text-muted-foreground">{c.label}</p>
          </Link>
        ))}
      </div>
    </AdminLayout>
  );
}
