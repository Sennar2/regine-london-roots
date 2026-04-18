import { Link, useNavigate, useRouterState } from "@tanstack/react-router";
import type { ReactNode } from "react";
import { LayoutDashboard, MapPin, UtensilsCrossed, FileText, Image, Link as LinkIcon, Info, Settings, Mail, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Logo } from "@/components/site/Logo";
import { supabase } from "@/integrations/supabase/client";
import { useAdminAuth } from "@/lib/admin-auth";

const NAV = [
  { to: "/admin", label: "Dashboard", icon: LayoutDashboard, exact: true },
  { to: "/admin/locations", label: "Locations", icon: MapPin },
  { to: "/admin/menus", label: "Menus", icon: UtensilsCrossed },
  { to: "/admin/files", label: "Files", icon: FileText },
  { to: "/admin/gallery", label: "Gallery", icon: Image },
  { to: "/admin/links", label: "Links", icon: LinkIcon },
  { to: "/admin/about", label: "About", icon: Info },
  { to: "/admin/settings", label: "Site & Branding", icon: Settings },
  { to: "/admin/messages", label: "Messages", icon: Mail },
] as const;

export function AdminLayout({ children }: { children: ReactNode }) {
  const { loading, session, isAdmin } = useAdminAuth();
  const navigate = useNavigate();
  const { location } = useRouterState();

  if (loading) return <div className="flex min-h-screen items-center justify-center text-muted-foreground">Loading…</div>;
  if (!session || !isAdmin) {
    if (typeof window !== "undefined" && location.pathname !== "/admin/login") {
      navigate({ to: "/admin/login", replace: true });
    }
    return null;
  }

  return (
    <div className="flex min-h-screen bg-secondary/30">
      <aside className="hidden w-64 shrink-0 border-r border-border bg-background md:block">
        <div className="flex h-16 items-center border-b border-border px-5"><Logo className="h-9 w-auto" /></div>
        <nav className="space-y-1 p-3">
          {NAV.map((n) => (
            <Link key={n.to} to={n.to} activeOptions={{ exact: !!n.exact }} activeProps={{ className: "bg-primary/10 text-primary" }} className="flex items-center gap-2 rounded-md px-3 py-2 text-sm text-foreground/80 hover:bg-secondary">
              <n.icon className="h-4 w-4" /> {n.label}
            </Link>
          ))}
        </nav>
        <div className="p-3">
          <Button variant="outline" size="sm" className="w-full" onClick={async () => { await supabase.auth.signOut(); navigate({ to: "/admin/login" }); }}>
            <LogOut className="mr-2 h-4 w-4" /> Sign out
          </Button>
        </div>
      </aside>
      <div className="flex-1">
        <header className="flex h-16 items-center justify-between border-b border-border bg-background px-4 md:px-8">
          <div className="md:hidden"><Logo className="h-8" /></div>
          <div className="flex items-center gap-3 text-sm text-muted-foreground">
            <span className="hidden sm:inline">Signed in as {session.user.email}</span>
            <Button asChild variant="ghost" size="sm"><Link to="/">View site</Link></Button>
          </div>
        </header>
        <main className="p-4 md:p-8">{children}</main>
        {/* mobile nav */}
        <nav className="fixed inset-x-0 bottom-0 z-30 flex justify-around border-t border-border bg-background py-2 md:hidden">
          {NAV.slice(0, 5).map((n) => (
            <Link key={n.to} to={n.to} activeOptions={{ exact: !!n.exact }} activeProps={{ className: "text-primary" }} className="flex flex-col items-center text-[10px] text-muted-foreground">
              <n.icon className="mb-1 h-5 w-5" />{n.label}
            </Link>
          ))}
        </nav>
      </div>
    </div>
  );
}
