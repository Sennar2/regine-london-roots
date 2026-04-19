import type { ReactNode } from "react";
import { Header } from "./Header";
import { Footer } from "./Footer";
import { IntroOverlay } from "./IntroOverlay";

export function PublicLayout({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col bg-background text-foreground">
      <IntroOverlay />
      <Header />
      <main className="flex-1">{children}</main>
      <Footer />
    </div>
  );
}
