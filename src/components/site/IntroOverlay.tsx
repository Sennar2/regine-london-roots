import { useEffect, useState } from "react";
import { Logo } from "./Logo";

const KEY = "regine_intro_seen";

export function IntroOverlay() {
  const [show, setShow] = useState(false);
  const [closing, setClosing] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;
    try {
      if (sessionStorage.getItem(KEY)) return;
    } catch {
      return;
    }
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduced) {
      try { sessionStorage.setItem(KEY, "1"); } catch { /* noop */ }
      return;
    }
    setShow(true);
    try { sessionStorage.setItem(KEY, "1"); } catch { /* noop */ }

    const dismiss = () => {
      setClosing(true);
      window.setTimeout(() => setShow(false), 450);
    };
    const t = window.setTimeout(dismiss, 1700);
    const onAny = () => dismiss();
    window.addEventListener("click", onAny, { once: true });
    window.addEventListener("keydown", onAny, { once: true });
    window.addEventListener("scroll", onAny, { once: true, passive: true });

    return () => {
      window.clearTimeout(t);
      window.removeEventListener("click", onAny);
      window.removeEventListener("keydown", onAny);
      window.removeEventListener("scroll", onAny);
    };
  }, []);

  if (!show) return null;

  return (
    <div
      aria-hidden
      className={`fixed inset-0 z-[100] flex flex-col items-center justify-center bg-brand-cream transition-opacity duration-500 ${
        closing ? "pointer-events-none opacity-0" : "opacity-100"
      }`}
    >
      <div className="animate-[introLogo_900ms_ease-out_both]">
        <Logo className="h-20 w-auto sm:h-24" />
      </div>
      <p className="mt-6 px-6 text-center font-serif text-lg italic text-brand-charcoal/80 sm:text-xl animate-[introText_1100ms_ease-out_200ms_both]">
        Southern Italian warmth, served in London.
      </p>
      <span className="absolute bottom-8 text-[11px] uppercase tracking-[0.25em] text-brand-charcoal/40">
        tap to enter
      </span>
      <style>{`
        @keyframes introLogo {
          0% { opacity: 0; transform: scale(0.92); }
          100% { opacity: 1; transform: scale(1); }
        }
        @keyframes introText {
          0% { opacity: 0; transform: translateY(10px); }
          100% { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
}
