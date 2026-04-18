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
import { Trash2, Plus } from "lucide-react";

export const Route = createFileRoute("/admin/locations")({
  head: () => ({ meta: [{ title: "Locations — Admin" }, { name: "robots", content: "noindex" }] }),
  component: LocationsAdmin,
});

type Loc = {
  id: string; name: string; slug: string; area: string | null; address: string | null; postcode: string | null;
  phone: string | null; email: string | null; description: string | null; hero_image_url: string | null;
  maps_link: string | null; booking_link: string | null; is_active: boolean; display_order: number;
  opening_hours: { day: string; hours: string }[] | null;
  gallery_image_urls: string[] | null;
};

const empty = (): Partial<Loc> => ({ name: "", slug: "", is_active: true, display_order: 0, opening_hours: [], gallery_image_urls: [] });

function LocationsAdmin() {
  const [list, setList] = useState<Loc[]>([]);
  const [editing, setEditing] = useState<Partial<Loc> | null>(null);

  async function load() {
    const { data } = await supabase.from("locations").select("*").order("display_order");
    setList((data as Loc[] | null) ?? []);
  }
  useEffect(() => { load(); }, []);

  async function save() {
    if (!editing?.name || !editing.slug) { toast.error("Name and slug are required"); return; }
    const payload = { ...editing };
    const { error } = editing.id
      ? await supabase.from("locations").update(payload).eq("id", editing.id)
      : await supabase.from("locations").insert(payload as never);
    if (error) { toast.error(error.message); return; }
    toast.success("Saved"); setEditing(null); load();
  }
  async function remove(id: string) {
    if (!confirm("Delete this location?")) return;
    const { error } = await supabase.from("locations").delete().eq("id", id);
    if (error) toast.error(error.message); else { toast.success("Deleted"); load(); }
  }

  return (
    <AdminLayout>
      <div className="flex items-center justify-between">
        <h1 className="font-serif text-3xl">Locations</h1>
        <Button onClick={() => setEditing(empty())}><Plus className="mr-2 h-4 w-4" /> New location</Button>
      </div>
      <div className="mt-6 space-y-3">
        {list.map((l) => (
          <div key={l.id} className="flex items-center justify-between rounded-lg border border-border bg-card p-4">
            <div>
              <p className="font-medium">{l.name} <span className="ml-2 text-xs text-muted-foreground">/{l.slug}</span></p>
              <p className="text-xs text-muted-foreground">{l.area} · {l.is_active ? "Active" : "Hidden"}</p>
            </div>
            <div className="flex gap-2">
              <Button size="sm" variant="outline" onClick={() => setEditing(l)}>Edit</Button>
              <Button size="sm" variant="ghost" onClick={() => remove(l.id)}><Trash2 className="h-4 w-4 text-destructive" /></Button>
            </div>
          </div>
        ))}
      </div>

      {editing && (
        <div className="fixed inset-0 z-50 flex items-start justify-center overflow-auto bg-black/40 p-4">
          <div className="my-8 w-full max-w-3xl rounded-2xl bg-card p-6 shadow-xl">
            <h2 className="font-serif text-2xl">{editing.id ? "Edit" : "New"} location</h2>
            <div className="mt-4 grid gap-4 sm:grid-cols-2">
              <Field label="Name"><Input value={editing.name ?? ""} onChange={(e) => setEditing({ ...editing, name: e.target.value })} /></Field>
              <Field label="Slug"><Input value={editing.slug ?? ""} onChange={(e) => setEditing({ ...editing, slug: e.target.value })} /></Field>
              <Field label="Area"><Input value={editing.area ?? ""} onChange={(e) => setEditing({ ...editing, area: e.target.value })} /></Field>
              <Field label="Postcode"><Input value={editing.postcode ?? ""} onChange={(e) => setEditing({ ...editing, postcode: e.target.value })} /></Field>
              <Field label="Address" className="sm:col-span-2"><Input value={editing.address ?? ""} onChange={(e) => setEditing({ ...editing, address: e.target.value })} /></Field>
              <Field label="Phone"><Input value={editing.phone ?? ""} onChange={(e) => setEditing({ ...editing, phone: e.target.value })} /></Field>
              <Field label="Email"><Input value={editing.email ?? ""} onChange={(e) => setEditing({ ...editing, email: e.target.value })} /></Field>
              <Field label="Maps link"><Input value={editing.maps_link ?? ""} onChange={(e) => setEditing({ ...editing, maps_link: e.target.value })} /></Field>
              <Field label="Booking link"><Input value={editing.booking_link ?? ""} onChange={(e) => setEditing({ ...editing, booking_link: e.target.value })} /></Field>
              <Field label="Description" className="sm:col-span-2"><Textarea rows={3} value={editing.description ?? ""} onChange={(e) => setEditing({ ...editing, description: e.target.value })} /></Field>
              <Field label="Hero image" className="sm:col-span-2">
                <div className="flex items-center gap-3">
                  {editing.hero_image_url && <img src={editing.hero_image_url} className="h-16 w-24 rounded object-cover" alt="" />}
                  <Input value={editing.hero_image_url ?? ""} onChange={(e) => setEditing({ ...editing, hero_image_url: e.target.value })} />
                  <FileUpload bucket="locations" accept="image/*" onUploaded={(url) => setEditing({ ...editing, hero_image_url: url })} />
                </div>
              </Field>
              <Field label="Opening hours (JSON: [{day,hours}])" className="sm:col-span-2">
                <Textarea rows={6} value={JSON.stringify(editing.opening_hours ?? [], null, 2)} onChange={(e) => { try { setEditing({ ...editing, opening_hours: JSON.parse(e.target.value) }); } catch { /* ignore */ } }} />
              </Field>
              <Field label="Gallery image URLs (one per line)" className="sm:col-span-2">
                <Textarea rows={4} value={(editing.gallery_image_urls ?? []).join("\n")} onChange={(e) => setEditing({ ...editing, gallery_image_urls: e.target.value.split("\n").map((s) => s.trim()).filter(Boolean) })} />
                <FileUpload bucket="locations" accept="image/*" onUploaded={(url) => setEditing({ ...editing, gallery_image_urls: [...(editing.gallery_image_urls ?? []), url] })} label="Add image" />
              </Field>
              <Field label="Display order"><Input type="number" value={editing.display_order ?? 0} onChange={(e) => setEditing({ ...editing, display_order: Number(e.target.value) })} /></Field>
              <Field label="Active"><label className="flex items-center gap-2"><input type="checkbox" checked={!!editing.is_active} onChange={(e) => setEditing({ ...editing, is_active: e.target.checked })} /> Visible on site</label></Field>
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
