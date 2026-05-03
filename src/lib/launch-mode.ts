const KEY = "regine_preview";
const DAYS = 7;

export type PreviewMode = "full" | "launch" | null;

export function readPreviewFromUrl(): PreviewMode {
  if (typeof window === "undefined") return null;
  const p = new URLSearchParams(window.location.search).get("preview");
  if (p === "full" || p === "launch") return p;
  return null;
}

export function getStoredPreview(): PreviewMode {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return null;
    const { mode, exp } = JSON.parse(raw) as { mode: PreviewMode; exp: number };
    if (Date.now() > exp) {
      localStorage.removeItem(KEY);
      return null;
    }
    return mode ?? null;
  } catch {
    return null;
  }
}

export function setStoredPreview(mode: PreviewMode) {
  if (typeof window === "undefined") return;
  if (!mode) {
    localStorage.removeItem(KEY);
    return;
  }
  localStorage.setItem(KEY, JSON.stringify({ mode, exp: Date.now() + DAYS * 86400_000 }));
}

export function clearPreview() {
  setStoredPreview(null);
}

/** Resolve the active preview mode, persisting any ?preview= flag in URL. */
export function resolvePreviewMode(): PreviewMode {
  const fromUrl = readPreviewFromUrl();
  if (fromUrl) {
    setStoredPreview(fromUrl);
    return fromUrl;
  }
  return getStoredPreview();
}
