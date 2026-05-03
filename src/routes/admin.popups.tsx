import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { FileUpload } from "@/components/admin/FileUpload";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Plus, Trash2, Megaphone } from "lucide-react";

export const Route = createFileRoute("/admin/popups")({
  head: () => ({ meta: [{ title: "Popups — Admin" }, { name: "robots", content: "noindex" }] }),
  component: PopupsAdmin,
});

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

const empty = (): Partial<Popup> => ({
  enabled: false, popup_type: "standard", countdown_enabled: false, whatsapp_cta_enabled: false,
  dismissible: true, overlay_opacity: 0.6, display_order: 0,
});

function toLocal(iso: string | null): string {
  if (!iso) return "";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "";
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

function PopupsAdmin() {
  const [list, setList] = useState<Popup[]>([]);
  const [editing, setEditing] = useState<Partial<Popup> | null>(null);

  async function load() {
    const { data } = await supabase.from("site_popups").select("*").order("display_order");
    setList((data as Popup[] | null) ?? []);
  }
  useEffect(() => { load(); }, []);

  async function save() {
    if (!editing) return;
    const payload = { ...editing };
    const { error } = editing.id
      ? await supabase.from("site_popups").update(payload).eq("id", editing.id)
      : await supabase.from("site_popups").insert(payload as never);
    if (error) toast.error(error.message);
    else { toast.success("Saved"); setEditing(null); load(); }
  }
  async function remove(id: string) {
    if (!confirm("Delete this popup?")) return;
    const { error } = await supabase.from("site_popups").delete().eq("id", id);
    if (error) toast.error(error.message); else { toast.success("Deleted"); load(); }
  }

  function set<K extends keyof Popup>(k: K, v: Popup[K] | null) {
    setEditing((e) => ({ ...(e ?? {}), [k]: v }));
  }

  return (
    <AdminLayout>
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-serif text-3xl">Popups</h1>
          <p className="mt-1 text-sm text-muted-foreground">Standard or full-screen announcements that appear on the public site.</p>
        </div>
        <Button onClick={() => setEditing(empty())}><Plus className="mr-2 h-4 w-4" /> New popup</Button>
      </div>

      <div className="mt-6 space-y-3">
        {list.length === 0 && (
          <div className="rounded-2xl border border-dashed border-border bg-card p-10 text-center">
            <Megaphone className="mx-auto h-8 w-8 text-muted-foreground" />
            <p className="mt-3 font-medium">No popups yet</p>
          </div>
        )}
        {list.map((p) => (
          <div key={p.id} className="flex items-center justify-between rounded-lg border border-border bg-card p-4">
            <div>
              <p className="font-medium">{p.title || "(untitled)"} <span className="ml-2 text-xs text-muted-foreground">{p.popup_type}</span></p>
              <p className="text-xs text-muted-foreground">{p.enabled ? "Enabled" : "Disabled"} · order {p.display_order}</p>
            </div>
            <div className="flex gap-2">
              <Button size="sm" variant="outline" onClick={() => setEditing(p)}>Edit</Button>
              <Button size="sm" variant="ghost" onClick={() => remove(p.id)}><Trash2 className="h-4 w-4 text-destructive" /></Button>
            </div>
          </div>
        ))}
      </div>

      {editing && (
        <div className="fixed inset-0 z-50 flex items-start justify-center overflow-auto bg-black/40 p-4">
          <div className="my-8 w-full max-w-2xl rounded-2xl bg-card p-6 shadow-xl">
            <h2 className="font-serif text-2xl">{editing.id ? "Edit" : "New"} popup</h2>
            <div className="mt-5 grid gap-4 sm:grid-cols-2">
              <Field label="Enabled">
                <label className="flex h-10 items-center gap-2 rounded-md border border-input bg-background px-3 text-sm">
                  <input type="checkbox" checked={!!editing.enabled} onChange={(e) => set("enabled", e.target.checked)} /> Show on site
                </label>
              </Field>
              <Field label="Type">
                <select className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm" value={editing.popup_type ?? "standard"} onChange={(e) => set("popup_type", e.target.value as Popup["popup_type"])}>
                  <option value="standard">Standard popup</option>
                  <option value="fullscreen">Full-screen</option>
                </select>
              </Field>
              <Field label="Title" className="sm:col-span-2"><Input value={editing.title ?? ""} onChange={(e) => set("title", e.target.value)} /></Field>
              <Field label="Subtitle / kicker" className="sm:col-span-2"><Input value={editing.subtitle ?? ""} onChange={(e) => set("subtitle", e.target.value)} /></Field>
              <Field label="Message" className="sm:col-span-2"><Textarea rows={3} value={editing.message ?? ""} onChange={(e) => set("message", e.target.value)} /></Field>
              <Field label="Supporting text" className="sm:col-span-2"><Textarea rows={2} value={editing.supporting_text ?? ""} onChange={(e) => set("supporting_text", e.target.value)} /></Field>

              <Field label="Countdown enabled">
                <label className="flex h-10 items-center gap-2 rounded-md border border-input bg-background px-3 text-sm">
                  <input type="checkbox" checked={!!editing.countdown_enabled} onChange={(e) => set("countdown_enabled", e.target.checked)} /> Show countdown
                </label>
              </Field>
              <Field label="Countdown target"><Input type="datetime-local" value={toLocal(editing.countdown_target ?? null)} onChange={(e) => set("countdown_target", e.target.value ? new Date(e.target.value).toISOString() : null)} /></Field>

              <Field label="Primary label"><Input value={editing.primary_label ?? ""} onChange={(e) => set("primary_label", e.target.value)} /></Field>
              <Field label="Primary link"><Input value={editing.primary_href ?? ""} onChange={(e) => set("primary_href", e.target.value)} /></Field>
              <Field label="Secondary label"><Input value={editing.secondary_label ?? ""} onChange={(e) => set("secondary_label", e.target.value)} /></Field>
              <Field label="Secondary link"><Input value={editing.secondary_href ?? ""} onChange={(e) => set("secondary_href", e.target.value)} /></Field>

              <Field label="WhatsApp CTA">
                <label className="flex h-10 items-center gap-2 rounded-md border border-input bg-background px-3 text-sm">
                  <input type="checkbox" checked={!!editing.whatsapp_cta_enabled} onChange={(e) => set("whatsapp_cta_enabled", e.target.checked)} /> Include WhatsApp button
                </label>
              </Field>
              <Field label="Dismissible">
                <label className="flex h-10 items-center gap-2 rounded-md border border-input bg-background px-3 text-sm">
                  <input type="checkbox" checked={!!editing.dismissible} onChange={(e) => set("dismissible", e.target.checked)} /> Allow visitors to close
                </label>
              </Field>

              <Field label="Background image" className="sm:col-span-2">
                <div className="flex items-center gap-3">
                  {editing.background_url && <img src={editing.background_url} className="h-12 w-20 rounded object-cover" alt="" />}
                  <Input value={editing.background_url ?? ""} onChange={(e) => set("background_url", e.target.value)} />
                  <FileUpload bucket="branding" accept="image/*" onUploaded={(url) => set("background_url", url)} />
                </div>
              </Field>
              <Field label="Overlay opacity (0–1)"><Input type="number" step="0.05" min="0" max="1" value={editing.overlay_opacity ?? 0.6} onChange={(e) => set("overlay_opacity", Number(e.target.value))} /></Field>
              <Field label="Display order"><Input type="number" value={editing.display_order ?? 0} onChange={(e) => set("display_order", Number(e.target.value))} /></Field>

              <Field label="Start at"><Input type="datetime-local" value={toLocal(editing.start_at ?? null)} onChange={(e) => set("start_at", e.target.value ? new Date(e.target.value).toISOString() : null)} /></Field>
              <Field label="End at"><Input type="datetime-local" value={toLocal(editing.end_at ?? null)} onChange={(e) => set("end_at", e.target.value ? new Date(e.target.value).toISOString() : null)} /></Field>
            </div>

            <div className="mt-6 flex justify-end gap-2">
              <Button variant="outline" onClick={() => setEditing(null)}>Cancel</Button>
              <Button onClick={save}>Save</Button>
            </div>
          </div>
        </div>
      )}
    </AdminLayout>
  );
}

function Field({ label, children, className = "" }: { label: string; children: React.ReactNode; className?: string }) {
  return <div className={className}><Label>{label}</Label><div className="mt-2">{children}</div></div>;
}
