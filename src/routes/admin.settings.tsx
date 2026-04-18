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

export const Route = createFileRoute("/admin/settings")({
  head: () => ({ meta: [{ title: "Settings — Admin" }, { name: "robots", content: "noindex" }] }),
  component: SettingsAdmin,
});

type S = {
  id: number; logo_url: string | null; favicon_url: string | null; brand_tagline: string | null; brand_description: string | null;
  contact_email: string | null; contact_phone: string | null; address: string | null; hours_summary: string | null;
  social_links: Record<string, string> | null; footer_text: string | null; cta_text: string | null; map_embed_url: string | null; enquiry_text: string | null;
};

function SettingsAdmin() {
  const [s, setS] = useState<S | null>(null);
  useEffect(() => { supabase.from("site_settings").select("*").eq("id", 1).maybeSingle().then(({ data }) => setS(data as S)); }, []);
  async function save() {
    if (!s) return;
    const { id: _id, ...rest } = s;
    void _id;
    const { error } = await supabase.from("site_settings").update(rest).eq("id", 1);
    if (error) toast.error(error.message); else toast.success("Saved");
  }
  if (!s) return <AdminLayout><p className="text-muted-foreground">Loading…</p></AdminLayout>;
  return (
    <AdminLayout>
      <h1 className="font-serif text-3xl">Site & Branding</h1>
      <div className="mt-6 grid max-w-4xl gap-6 lg:grid-cols-2">
        <Card title="Branding">
          <Field label="Logo">
            <div className="flex items-center gap-3">
              {s.logo_url && <img src={s.logo_url} className="h-12 w-12 rounded object-contain bg-muted" alt="" />}
              <Input value={s.logo_url ?? ""} onChange={(e) => setS({ ...s, logo_url: e.target.value })} />
              <FileUpload bucket="branding" accept="image/*" onUploaded={(url) => setS({ ...s, logo_url: url })} />
            </div>
          </Field>
          <Field label="Favicon">
            <div className="flex items-center gap-3">
              <Input value={s.favicon_url ?? ""} onChange={(e) => setS({ ...s, favicon_url: e.target.value })} />
              <FileUpload bucket="branding" accept="image/*" onUploaded={(url) => setS({ ...s, favicon_url: url })} />
            </div>
          </Field>
          <Field label="Tagline"><Input value={s.brand_tagline ?? ""} onChange={(e) => setS({ ...s, brand_tagline: e.target.value })} /></Field>
          <Field label="Description"><Textarea rows={3} value={s.brand_description ?? ""} onChange={(e) => setS({ ...s, brand_description: e.target.value })} /></Field>
          <Field label="Footer text"><Input value={s.footer_text ?? ""} onChange={(e) => setS({ ...s, footer_text: e.target.value })} /></Field>
          <Field label="CTA text"><Input value={s.cta_text ?? ""} onChange={(e) => setS({ ...s, cta_text: e.target.value })} /></Field>
        </Card>
        <Card title="Contact">
          <Field label="Email"><Input value={s.contact_email ?? ""} onChange={(e) => setS({ ...s, contact_email: e.target.value })} /></Field>
          <Field label="Phone"><Input value={s.contact_phone ?? ""} onChange={(e) => setS({ ...s, contact_phone: e.target.value })} /></Field>
          <Field label="Address"><Input value={s.address ?? ""} onChange={(e) => setS({ ...s, address: e.target.value })} /></Field>
          <Field label="Hours summary"><Input value={s.hours_summary ?? ""} onChange={(e) => setS({ ...s, hours_summary: e.target.value })} /></Field>
          <Field label="Enquiry text"><Textarea rows={2} value={s.enquiry_text ?? ""} onChange={(e) => setS({ ...s, enquiry_text: e.target.value })} /></Field>
          <Field label="Social links (JSON)">
            <Textarea rows={3} value={JSON.stringify(s.social_links ?? {}, null, 2)} onChange={(e) => { try { setS({ ...s, social_links: JSON.parse(e.target.value) }); } catch { /* ignore */ } }} />
          </Field>
          <Field label="Map embed URL"><Input value={s.map_embed_url ?? ""} onChange={(e) => setS({ ...s, map_embed_url: e.target.value })} /></Field>
        </Card>
      </div>
      <div className="mt-6"><Button onClick={save}>Save settings</Button></div>
    </AdminLayout>
  );
}

function Card({ title, children }: { title: string; children: React.ReactNode }) {
  return <div className="space-y-3 rounded-2xl border border-border bg-card p-6"><h2 className="font-serif text-xl">{title}</h2>{children}</div>;
}
function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return <div><Label>{label}</Label><div className="mt-2">{children}</div></div>;
}
