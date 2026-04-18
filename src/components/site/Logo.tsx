import { useEffect, useState } from "react";
import { fetchSiteSettings, FALLBACK_LOGO } from "@/lib/site";

export function Logo({ className = "h-10 w-auto", alt = "Reginè Pizzeria" }: { className?: string; alt?: string }) {
  const [src, setSrc] = useState<string>(FALLBACK_LOGO);
  useEffect(() => {
    fetchSiteSettings().then((s) => {
      if (s?.logo_url) setSrc(s.logo_url);
    });
  }, []);
  return <img src={src} alt={alt} className={className} loading="eager" decoding="async" />;
}
