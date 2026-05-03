import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

import { FileUpload } from "@/components/admin/FileUpload";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { setStoredPreview } from "@/lib/launch-mode";

export const Route = createFileRoute("/admin/launch")({
  head: () => ({ meta: [{ title: "Launch Mode — Admin" }, { name: "robots", content: "noindex" }] }),
  component: LaunchAdmin,
});

type L = {
  launch_mode_enabled: boolean;
  launch_title: string | null;
  launch_subtitle: string | null;
  launch_date: string | null;
  launch_countdown_enabled: boolean;
  launch_primary_label: string | null;
  launch_primary_href: string | null;
  launch_secondary_label: string | null;
  launch_secondary_href: string | null;
  launch_whatsapp_enabled: boolean;
  launch_instagram_enabled: boolean;
  launch_background_url: string | null;
  launch_dismissible: boolean;
};

function toLocalInput(iso: string | null): string {
  if (!iso) return "";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "";
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

function LaunchAdmin() {
  const [s, setS] = useState<L | null>(null);

  useEffect(() => {
    supabase.from("site_settings").select(
      "launch_mode_enabled,launch_title,launch_subtitle,launch_date,launch_countdown_enabled,launch_primary_label,launch_primary_href,launch_secondary_label,launch_secondary_href,launch_whatsapp_enabled,launch_instagram_enabled,launch_background_url,launch_dismissible",
    ).eq("id", 1).maybeSingle().then(({ data }) => setS(data as L));
  }, []);

  async function save() {
    if (!s) return;
    const { error } = await supabase.from("site_settings").update(s).eq("id", 1);
    if (error) toast.error(error.message); else toast.success("Saved");
  }

  if (!s) return <AdminLayout><p className="text-muted-foreground">Loading…</p></AdminLayout>;

  return (
    <AdminLayout>
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="font-serif text-3xl">Launch Mode</h1>
          <p className="mt-1 text-sm text-muted-foreground">When enabled, public visitors see only the launch / countdown screen. You stay signed in as admin so the full site is always accessible.</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={() => { setStoredPreview("full"); window.open("/", "_blank"); }}>Preview full site</Button>
          <Button variant="outline" size="sm" onClick={() => { setStoredPreview("launch"); window.open("/?preview=launch", "_blank"); }}>Preview launch</Button>
        </div>
      </div>

      <div className="mt-6 grid max-w-3xl gap-4">
        <Card title="Master toggle">
          <Toggle label="Enable launch mode for the public" checked={s.launch_mode_enabled} onChange={(v) => setS({ ...s, launch_mode_enabled: v })} />
          <p className="mt-2 text-xs text-muted-foreground">
            Admins always bypass launch mode. Append <code>?preview=full</code> to any URL to bypass on a non-admin device for 7 days.
          </p>
        </Card>

        <Card title="Content">
          <Field label="Title"><Input value={s.launch_title ?? ""} onChange={(e) => setS({ ...s, launch_title: e.target.value })} placeholder="Reginè arriviamo." /></Field>
          <Field label="Subtitle / location"><Input value={s.launch_subtitle ?? ""} onChange={(e) => setS({ ...s, launch_subtitle: e.target.value })} placeholder="Wandsworth" /></Field>
          <Field label="Launch date & time"><Input type="datetime-local" value={toLocalInput(s.launch_date)} onChange={(e) => setS({ ...s, launch_date: e.target.value ? new Date(e.target.value).toISOString() : null })} /></Field>
          <Toggle label="Show live countdown" checked={s.launch_countdown_enabled} onChange={(v) => setS({ ...s, launch_countdown_enabled: v })} />
        </Card>

        <Card title="Calls to action">
          <div className="grid gap-3 sm:grid-cols-2">
            <Field label="Primary CTA label"><Input value={s.launch_primary_label ?? ""} onChange={(e) => setS({ ...s, launch_primary_label: e.target.value })} /></Field>
            <Field label="Primary CTA link"><Input value={s.launch_primary_href ?? ""} onChange={(e) => setS({ ...s, launch_primary_href: e.target.value })} /></Field>
            <Field label="Secondary CTA label"><Input value={s.launch_secondary_label ?? ""} onChange={(e) => setS({ ...s, launch_secondary_label: e.target.value })} /></Field>
            <Field label="Secondary CTA link"><Input value={s.launch_secondary_href ?? ""} onChange={(e) => setS({ ...s, launch_secondary_href: e.target.value })} /></Field>
          </div>
          <Toggle label="Show WhatsApp CTA (uses site-wide WhatsApp settings)" checked={s.launch_whatsapp_enabled} onChange={(v) => setS({ ...s, launch_whatsapp_enabled: v })} />
          <Toggle label="Show Instagram CTA (uses site-wide social link)" checked={s.launch_instagram_enabled} onChange={(v) => setS({ ...s, launch_instagram_enabled: v })} />
        </Card>

        <Card title="Background">
          <Field label="Background image (optional)">
            <div className="flex items-center gap-3">
              {s.launch_background_url && <img src={s.launch_background_url} className="h-16 w-24 rounded object-cover" alt="" />}
              <Input value={s.launch_background_url ?? ""} onChange={(e) => setS({ ...s, launch_background_url: e.target.value })} />
              <FileUpload bucket="branding" accept="image/*" onUploaded={(url) => setS({ ...s, launch_background_url: url })} />
              {s.launch_background_url && <Button type="button" variant="outline" size="sm" onClick={() => setS({ ...s, launch_background_url: null })}>Remove</Button>}
            </div>
          </Field>
          <Toggle label="Allow visitors to dismiss launch screen" checked={s.launch_dismissible} onChange={(v) => setS({ ...s, launch_dismissible: v })} />
        </Card>
      </div>

      <div className="mt-6"><Button onClick={save}>Save launch settings</Button></div>
    </AdminLayout>
  );
}

function Card({ title, children }: { title: string; children: React.ReactNode }) {
  return <div className="space-y-3 rounded-2xl border border-border bg-card p-6"><h2 className="font-serif text-xl">{title}</h2>{children}</div>;
}
function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return <div><Label>{label}</Label><div className="mt-2">{children}</div></div>;
}
function Toggle({ label, checked, onChange }: { label: string; checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <label className="flex items-center gap-3 rounded-md border border-input bg-background px-3 py-2 text-sm">
      <input type="checkbox" checked={checked} onChange={(e) => onChange(e.target.checked)} />
      <span>{label}</span>
    </label>
  );
}

