import { useEffect, useMemo, useState } from "react";
import { X } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { WhatsAppCTA } from "./WhatsAppCTA";
import { cn } from "@/lib/utils";

type Popup = {
  id: string;
  enabled: boolean;
  popup_type: "standard" | "fullscreen";
  title: string | null;
  subtitle: string | null;
  message: string | null;
  supporting_text: string | null;
  countdown_enabled: boolean;
  countdown_target: string | null;
  primary_label: string | null;
  primary_href: string | null;
  secondary_label: string | null;
  secondary_href: string | null;
  whatsapp_cta_enabled: boolean;
  dismissible: boolean;
  background_url: string | null;
  overlay_opacity: number;
  start_at: string | null;
  end_at: string | null;
  display_order: number;
};

type WAProps = {
  whatsapp_number: string | null;
  whatsapp_url: string | null;
  whatsapp_default_message: string | null;
  whatsapp_button_label: string | null;
};

const DISMISS_KEY = (id: string) => `regine_popup_dismissed_${id}`;

function useCountdown(targetIso: string | null, enabled: boolean) {
  const [now, setNow] = useState(Date.now());
  useEffect(() => {
    if (!enabled || !targetIso) return;
    const t = window.setInterval(() => setNow(Date.now()), 1000);
    return () => window.clearInterval(t);
  }, [enabled, targetIso]);
  return useMemo(() => {
    if (!enabled || !targetIso) return null;
    const diff = Math.max(0, new Date(targetIso).getTime() - now);
    const d = Math.floor(diff / 86400_000);
    const h = Math.floor((diff % 86400_000) / 3600_000);
    const m = Math.floor((diff % 3600_000) / 60_000);
    const s = Math.floor((diff % 60_000) / 1000);
    return { d, h, m, s };
  }, [enabled, targetIso, now]);
}

export function SitePopup({ wa }: { wa: WAProps }) {
  const [popup, setPopup] = useState<Popup | null>(null);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    const nowIso = new Date().toISOString();
    supabase
      .from("site_popups")
      .select("*")
      .eq("enabled", true)
      .or(`start_at.is.null,start_at.lte.${nowIso}`)
      .or(`end_at.is.null,end_at.gte.${nowIso}`)
      .order("display_order")
      .limit(1)
      .then(({ data }) => {
        const p = (data?.[0] as Popup | undefined) ?? null;
        if (p && p.dismissible && typeof window !== "undefined" && localStorage.getItem(DISMISS_KEY(p.id))) {
          return;
        }
        setPopup(p);
      });
  }, []);

  const cd = useCountdown(popup?.countdown_target ?? null, !!popup?.countdown_enabled);

  if (!popup || dismissed) return null;

  const close = () => {
    if (popup.dismissible && typeof window !== "undefined") {
      localStorage.setItem(DISMISS_KEY(popup.id), "1");
    }
    setDismissed(true);
  };

  const isFull = popup.popup_type === "fullscreen";
  const overlay = `rgba(20,20,20,${popup.overlay_opacity ?? 0.6})`;

  return (
    <div
      className={cn("fixed inset-0 z-[80] flex items-center justify-center p-4", isFull && "p-0")}
      style={{ backgroundColor: overlay }}
      role="dialog"
      aria-modal="true"
    >
      <div
        className={cn(
          "relative overflow-hidden bg-brand-cream text-brand-charcoal shadow-2xl",
          isFull ? "h-full w-full" : "max-w-lg w-full rounded-2xl",
        )}
      >
        {popup.background_url && (
          <>
            <img src={popup.background_url} alt="" aria-hidden className="absolute inset-0 h-full w-full object-cover" />
            <div className="absolute inset-0 bg-brand-cream/80" />
          </>
        )}
        <div className="relative flex h-full flex-col items-center justify-center px-6 py-10 text-center sm:px-10">
          {popup.dismissible && (
            <button
              onClick={close}
              aria-label="Close"
              className="absolute right-4 top-4 inline-flex h-9 w-9 items-center justify-center rounded-full bg-brand-cream/70 text-brand-charcoal/80 hover:bg-brand-cream"
            >
              <X className="h-4 w-4" />
            </button>
          )}
          {popup.subtitle && (
            <p className="text-[11px] font-medium uppercase tracking-[0.3em] text-brand-gold">{popup.subtitle}</p>
          )}
          {popup.title && (
            <h2 className={cn("mt-3 font-serif font-medium leading-tight text-balance", isFull ? "text-4xl sm:text-6xl" : "text-3xl")}>
              {popup.title}
            </h2>
          )}
          {popup.message && <p className="mt-4 max-w-xl text-base text-brand-charcoal/80">{popup.message}</p>}
          {popup.supporting_text && (
            <p className="mt-2 max-w-xl text-sm text-brand-charcoal/65">{popup.supporting_text}</p>
          )}
          {cd && (
            <div className="mt-6 grid grid-cols-4 gap-3">
              {[{ v: cd.d, l: "D" }, { v: cd.h, l: "H" }, { v: cd.m, l: "M" }, { v: cd.s, l: "S" }].map((u) => (
                <div key={u.l} className="flex w-14 flex-col items-center">
                  <span className="font-serif text-2xl tabular-nums">{String(u.v).padStart(2, "0")}</span>
                  <span className="text-[10px] uppercase tracking-[0.25em] text-brand-charcoal/60">{u.l}</span>
                </div>
              ))}
            </div>
          )}
          <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
            {popup.primary_label && popup.primary_href && (
              <Button asChild><a href={popup.primary_href}>{popup.primary_label}</a></Button>
            )}
            {popup.secondary_label && popup.secondary_href && (
              <Button asChild variant="outline"><a href={popup.secondary_href}>{popup.secondary_label}</a></Button>
            )}
            {popup.whatsapp_cta_enabled && (
              <WhatsAppCTA
                number={wa.whatsapp_number}
                url={wa.whatsapp_url}
                message={wa.whatsapp_default_message}
                label={wa.whatsapp_button_label}
              />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
