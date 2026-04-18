import { Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Logo } from "./Logo";
import { fetchSiteSettings, type SiteSettings } from "@/lib/site";

export function Footer() {
  const [s, setS] = useState<SiteSettings | null>(null);
  useEffect(() => { fetchSiteSettings().then(setS); }, []);
  return (
    <footer className="mt-24 border-t border-border/60 bg-secondary/40">
      <div className="mx-auto grid max-w-7xl gap-10 px-4 py-14 sm:px-6 lg:px-8 md:grid-cols-4">
        <div className="md:col-span-2">
          <Logo className="h-12 w-auto" />
          <p className="mt-4 max-w-sm text-sm text-muted-foreground text-pretty">
            {s?.brand_description ?? "Reginè Pizzeria — a Southern Italian family pizzeria in London."}
          </p>
        </div>
        <div>
          <h4 className="text-sm font-semibold uppercase tracking-wider text-foreground">Visit</h4>
          <ul className="mt-4 space-y-2 text-sm text-muted-foreground">
            {s?.address && <li>{s.address}</li>}
            {s?.hours_summary && <li>{s.hours_summary}</li>}
            {s?.contact_phone && <li><a href={`tel:${s.contact_phone}`} className="hover:text-primary">{s.contact_phone}</a></li>}
            {s?.contact_email && <li><a href={`mailto:${s.contact_email}`} className="hover:text-primary">{s.contact_email}</a></li>}
          </ul>
        </div>
        <div>
          <h4 className="text-sm font-semibold uppercase tracking-wider text-foreground">Explore</h4>
          <ul className="mt-4 space-y-2 text-sm">
            <li><Link to="/about" className="text-muted-foreground hover:text-primary">About</Link></li>
            <li><Link to="/locations" className="text-muted-foreground hover:text-primary">Locations</Link></li>
            <li><Link to="/menus" className="text-muted-foreground hover:text-primary">Menus</Link></li>
            <li><Link to="/gallery" className="text-muted-foreground hover:text-primary">Gallery</Link></li>
            <li><Link to="/contact" className="text-muted-foreground hover:text-primary">Contact</Link></li>
          </ul>
        </div>
      </div>
      <div className="border-t border-border/60">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-2 px-4 py-5 text-xs text-muted-foreground sm:flex-row sm:px-6 lg:px-8">
          <p>{s?.footer_text ?? "© Reginè Pizzeria"}</p>
          <Link to="/admin" className="hover:text-primary">Admin</Link>
        </div>
      </div>
    </footer>
  );
}
