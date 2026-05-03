export type WhatsAppInput = {
  number?: string | null;
  url?: string | null;
  message?: string | null;
};

/** Returns a wa.me URL with optional prefilled message, or null if neither number nor URL is set. */
export function buildWhatsAppUrl({ number, url, message }: WhatsAppInput): string | null {
  const text = message?.trim();
  if (number && number.trim()) {
    const digits = number.replace(/\D+/g, "");
    if (digits.length >= 6) {
      const base = `https://wa.me/${digits}`;
      return text ? `${base}?text=${encodeURIComponent(text)}` : base;
    }
  }
  if (url && url.trim()) {
    if (text && !/[?&]text=/.test(url)) {
      const sep = url.includes("?") ? "&" : "?";
      return `${url}${sep}text=${encodeURIComponent(text)}`;
    }
    return url;
  }
  return null;
}

/** Pick location-specific WhatsApp first, falling back to site-wide. */
export function resolveWhatsApp(
  location: WhatsAppInput | null | undefined,
  site: WhatsAppInput | null | undefined,
): string | null {
  return (
    buildWhatsAppUrl(location ?? {}) ??
    buildWhatsAppUrl(site ?? {})
  );
}
