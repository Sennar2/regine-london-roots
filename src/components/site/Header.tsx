import { Link } from "@tanstack/react-router";
import { useState } from "react";
import { Menu, X } from "lucide-react";
import { Logo } from "./Logo";
import { Button } from "@/components/ui/button";

const NAV = [
  { to: "/", label: "Home" },
  { to: "/about", label: "About" },
  { to: "/locations", label: "Locations" },
  { to: "/menus", label: "Menus" },
  { to: "/gallery", label: "Gallery" },
  { to: "/contact", label: "Contact" },
] as const;

export function Header() {
  const [open, setOpen] = useState(false);
  return (
    <header className="sticky top-0 z-40 border-b border-border/60 bg-background/85 backdrop-blur">
      <div className="mx-auto flex h-18 max-w-7xl items-center justify-between gap-4 px-4 py-3 sm:px-6 lg:px-8">
        <Link to="/" className="flex items-center gap-2" aria-label="Reginè Pizzeria home">
          <Logo className="h-12 w-auto" />
        </Link>
        <nav className="hidden md:flex items-center gap-8 text-sm font-medium">
          {NAV.map((n) => (
            <Link
              key={n.to}
              to={n.to}
              className="text-foreground/75 transition-colors hover:text-primary"
              activeProps={{ className: "text-primary" }}
              activeOptions={{ exact: n.to === "/" }}
            >
              {n.label}
            </Link>
          ))}
        </nav>
        <div className="hidden md:block">
          <Button asChild size="sm" variant="gold">
            <Link to="/menus">View Menus</Link>
          </Button>
        </div>
        <button
          className="md:hidden inline-flex h-10 w-10 items-center justify-center rounded-md text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          aria-label="Toggle menu"
          aria-expanded={open}
          onClick={() => setOpen((o) => !o)}
        >
          {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>
      {open && (
        <div className="md:hidden border-t border-border/60 bg-background animate-[fadeSlide_220ms_ease-out_both]">
          <div className="mx-auto max-w-7xl px-4 py-4 flex flex-col gap-1">
            {NAV.map((n) => (
              <Link
                key={n.to}
                to={n.to}
                onClick={() => setOpen(false)}
                className="rounded-md px-2 py-2.5 text-base font-medium text-foreground/85 hover:bg-accent/10"
                activeProps={{ className: "text-primary" }}
                activeOptions={{ exact: n.to === "/" }}
              >
                {n.label}
              </Link>
            ))}
            <Button asChild className="mt-3" variant="gold">
              <Link to="/menus" onClick={() => setOpen(false)}>View Menus</Link>
            </Button>
          </div>
          <style>{`
            @keyframes fadeSlide {
              0% { opacity: 0; transform: translateY(-6px); }
              100% { opacity: 1; transform: translateY(0); }
            }
          `}</style>
        </div>
      )}
    </header>
  );
}
