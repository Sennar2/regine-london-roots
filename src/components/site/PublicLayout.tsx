import { useEffect, useState, type ReactNode } from "react";
import { Header } from "./Header";
import { Footer } from "./Footer";
import { IntroOverlay } from "./IntroOverlay";
import { LaunchScreen, type LaunchSettings } from "./LaunchScreen";
import { SitePopup } from "./SitePopup";
import { supabase } from "@/integrations/supabase/client";
import { useAdminAuth } from "@/lib/admin-auth";
import { resolvePreviewMode } from "@/lib/launch-mode";

type Settings = LaunchSettings & {
  launch_mode_enabled: boolean | null;
};

export function PublicLayout({ children }: { children: ReactNode }) {
  const { isAdmin } = useAdminAuth();
  const [settings, setSettings] = useState<Settings | null>(null);
  const [loaded, setLoaded] = useState(false);
  const [preview, setPreview] = useState<"full" | "launch" | null>(null);

  useEffect(() => {
    setPreview(resolvePreviewMode());
  }, []);

  useEffect(() => {
    supabase
      .from("site_settings")
      .select(
        "launch_mode_enabled,launch_title,launch_subtitle,launch_date,launch_countdown_enabled,launch_primary_label,launch_primary_href,launch_secondary_label,launch_secondary_href,launch_whatsapp_enabled,launch_instagram_enabled,launch_background_url,whatsapp_number,whatsapp_url,whatsapp_default_message,whatsapp_button_label,social_links,contact_email",
      )
      .eq("id", 1)
      .maybeSingle()
      .then(({ data }) => {
        setSettings((data as Settings | null) ?? null);
        setLoaded(true);
      });
  }, []);

  if (!loaded) {
    return <div className="min-h-screen bg-background" />;
  }

  const launchOn = !!settings?.launch_mode_enabled;
  const showLaunch = preview === "launch" || (launchOn && !isAdmin && preview !== "full");

  if (showLaunch && settings) {
    return <LaunchScreen s={settings} />;
  }

  return (
    <div className="flex min-h-screen flex-col bg-background text-foreground">
      <IntroOverlay />
      <Header whatsapp={settings ?? undefined} />
      <main className="flex-1">{children}</main>
      <Footer />
      {settings && (
        <SitePopup
          wa={{
            whatsapp_number: settings.whatsapp_number,
            whatsapp_url: settings.whatsapp_url,
            whatsapp_default_message: settings.whatsapp_default_message,
            whatsapp_button_label: settings.whatsapp_button_label,
          }}
        />
      )}
    </div>
  );
}
