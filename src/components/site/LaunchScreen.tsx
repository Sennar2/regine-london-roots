import { useEffect, useMemo, useState } from "react";
import { Instagram, Mail } from "lucide-react";
import { Logo } from "./Logo";
import { Button } from "@/components/ui/button";
import { WhatsAppCTA } from "./WhatsAppCTA";
import { getSocial } from "@/lib/site";
import { cn } from "@/lib/utils";

export type LaunchSettings = {
  launch_title: string | null;
  launch_subtitle: string | null;
  launch_date: string | null;
  launch_countdown_enabled: boolean | null;
  launch_primary_label: string | null;
  launch_primary_href: string | null;
  launch_secondary_label: string | null;
  launch_secondary_href: string | null;
  launch_whatsapp_enabled: boolean | null;
  launch_instagram_enabled: boolean | null;
  launch_background_url: string | null;
  whatsapp_number: string | null;
  whatsapp_url: string | null;
  whatsapp_default_message: string | null;
  whatsapp_button_label: string | null;
  social_links: Record<string, string> | null;
  contact_email: string | null;
};

function useCountdown(target: Date | null) {
  const [now, setNow] = useState<number>(() => Date.now());
  useEffect(() => {
    if (!target) return;
    const t = window.setInterval(() => setNow(Date.now()), 1000);
    return () => window.clearInterval(t);
  }, [target]);
  return useMemo(() => {
    if (!target) return null;
    const diff = Math.max(0, target.getTime() - now);
    const days = Math.floor(diff / 86400_000);
    const hours = Math.floor((diff % 86400_000) / 3600_000);
    const mins = Math.floor((diff % 3600_000) / 60_000);
    const secs = Math.floor((diff % 60_000) / 1000);
    return { days, hours, mins, secs };
  }, [target, now]);
}

function formatDate(iso: string | null): string {
  if (!iso) return "";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "";
  const dd = String(d.getDate()).padStart(2, "0");
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  return `${dd} / ${mm} / ${d.getFullYear()}`;
}

export function LaunchScreen({ s }: { s: LaunchSettings }) {
  const target = s.launch_date ? new Date(s.launch_date) : null;
  const cd = useCountdown(s.launch_countdown_enabled ? target : null);
  const instagram = getSocial(s.social_links, "instagram");
  const dateLabel = formatDate(s.launch_date);

  return (
    <div className="relative min-h-screen overflow-hidden bg-brand-cream text-brand-charcoal">
      {s.launch_background_url && (
        <>
          <img src={s.launch_background_url} alt="" aria-hidden className="absolute inset-0 h-full w-full object-cover" />
          <div className="absolute inset-0 bg-brand-cream/80" />
        </>
      )}
      <div className={cn("absolute inset-0 bg-motif opacity-60", s.launch_background_url && "opacity-30")} />
      <div className="pointer-events-none absolute -left-32 -top-32 h-80 w-80 rounded-full bg-brand-terracotta/15 blur-3xl" />
      <div className="pointer-events-none absolute -right-32 -bottom-32 h-80 w-80 rounded-full bg-brand-gold/15 blur-3xl" />

      <div className="relative mx-auto flex min-h-screen max-w-3xl flex-col items-center justify-between px-6 py-10 text-center sm:py-14">
        <Logo className="h-14 w-auto sm:h-16" />

        <div className="flex flex-col items-center">
          <p className="text-[11px] font-medium uppercase tracking-[0.4em] text-brand-gold">
            Coming soon
          </p>
          <h1 className="mt-6 font-serif text-5xl font-medium leading-[1.02] text-balance sm:text-6xl md:text-7xl lg:text-[5.5rem]">
            {s.launch_title || "Reginè arriviamo."}
          </h1>

          <div className="mt-10 flex items-center justify-center gap-5">
            <span className="h-px w-10 bg-brand-charcoal/30 sm:w-16" />
            <span className="text-xs font-medium uppercase tracking-[0.3em] text-brand-charcoal/70">
              {s.launch_subtitle || "Wandsworth"}
            </span>
            <span className="h-px w-10 bg-brand-charcoal/30 sm:w-16" />
          </div>

          {dateLabel && (
            <p className="mt-4 font-serif text-2xl font-light tracking-[0.18em] text-brand-charcoal/85 sm:text-3xl">
              {dateLabel}
            </p>
          )}

          {cd && (
            <div className="mt-10 grid grid-cols-4 gap-3 sm:gap-6">
              {[
                { v: cd.days, l: "Days" },
                { v: cd.hours, l: "Hours" },
                { v: cd.mins, l: "Minutes" },
                { v: cd.secs, l: "Seconds" },
              ].map((u) => (
                <div key={u.l} className="flex w-16 flex-col items-center sm:w-20">
                  <span className="font-serif text-3xl font-medium tabular-nums text-brand-charcoal sm:text-5xl">
                    {String(u.v).padStart(2, "0")}
                  </span>
                  <span className="mt-1 text-[10px] font-medium uppercase tracking-[0.25em] text-brand-charcoal/60 sm:text-[11px]">
                    {u.l}
                  </span>
                </div>
              ))}
            </div>
          )}

          <div className="mt-10 flex flex-wrap items-center justify-center gap-3">
            {s.launch_primary_label && s.launch_primary_href && (
              <Button asChild size="lg" variant="default">
                <a href={s.launch_primary_href}>{s.launch_primary_label}</a>
              </Button>
            )}
            {s.launch_secondary_label && s.launch_secondary_href && (
              <Button asChild size="lg" variant="outline">
                <a href={s.launch_secondary_href}>{s.launch_secondary_label}</a>
              </Button>
            )}
            {s.launch_whatsapp_enabled && (
              <WhatsAppCTA
                number={s.whatsapp_number}
                url={s.whatsapp_url}
                message={s.whatsapp_default_message}
                label={s.whatsapp_button_label}
                size="lg"
              />
            )}
            {s.launch_instagram_enabled && instagram && (
              <Button asChild size="lg" variant="outline">
                <a href={instagram} target="_blank" rel="noreferrer noopener">
                  <Instagram className="mr-1 h-4 w-4" /> Instagram
                </a>
              </Button>
            )}
            {s.contact_email && (
              <Button asChild size="lg" variant="ghost">
                <a href={`mailto:${s.contact_email}`}>
                  <Mail className="mr-1 h-4 w-4" /> Contact
                </a>
              </Button>
            )}
          </div>
        </div>

        <p className="text-[11px] uppercase tracking-[0.3em] text-brand-charcoal/55">
          Southern Italian · London
        </p>
      </div>
    </div>
  );
}
