import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { FileUpload } from "@/components/admin/FileUpload";
import { HoursEditor } from "@/components/admin/HoursEditor";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Trash2, Plus, MapPin } from "lucide-react";

export const Route = createFileRoute("/admin/locations")({
  head: () => ({ meta: [{ title: "Locations — Admin" }, { name: "robots", content: "noindex,nofollow" }] }),
  component: LocationsAdmin,
});

type Loc = {
  id: string; name: string; slug: string; area: string | null; address: string | null; postcode: string | null;
  phone: string | null; email: string | null;
  description: string | null; full_description: string | null;
  hero_image_url: string | null;
  hero_eyebrow: string | null; hero_title: string | null; hero_subtitle: string | null;
  hero_cta_label: string | null; hero_cta_href: string | null;
  maps_link: string | null; booking_link: string | null;
  deliveroo_url: string | null; justeat_url: string | null; ubereats_url: string | null; click_collect_url: string | null;
  is_active: boolean; is_featured: boolean; display_order: number;
  opening_hours: { day: string; hours: string }[] | null;
  gallery_image_urls: string[] | null;
};

const empty = (): Partial<Loc> => ({
  name: "", slug: "", is_active: true, is_featured: false, display_order: 0,
  opening_hours: [], gallery_image_urls: [],
});

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

  function set<K extends keyof Loc>(k: K, v: Loc[K] | null | undefined) {
    setEditing((e) => ({ ...(e ?? {}), [k]: v }));
  }

  return (
    <AdminLayout>
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-serif text-3xl">Locations</h1>
          <p className="mt-1 text-sm text-muted-foreground">Manage every Reginè pizzeria — details, hours, photos and ordering links.</p>
        </div>
        <Button onClick={() => setEditing(empty())}><Plus className="mr-2 h-4 w-4" /> New location</Button>
      </div>

      <div className="mt-6 space-y-3">
        {list.length === 0 && (
          <div className="rounded-2xl border border-dashed border-border bg-card p-10 text-center">
            <MapPin className="mx-auto h-8 w-8 text-muted-foreground" />
            <p className="mt-3 font-medium">No locations yet</p>
            <p className="mt-1 text-sm text-muted-foreground">Add your first pizzeria to start showing it on the site.</p>
          </div>
        )}
        {list.map((l) => (
          <div key={l.id} className="flex items-center justify-between rounded-lg border border-border bg-card p-4">
            <div>
              <p className="font-medium">
                {l.name}
                <span className="ml-2 text-xs text-muted-foreground">/{l.slug}</span>
                {l.is_featured && <span className="ml-2 rounded bg-brand-gold/20 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-brand-charcoal">Featured</span>}
              </p>
              <p className="text-xs text-muted-foreground">{l.area ?? "—"} · {l.is_active ? "Active" : "Hidden"}</p>
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

            <Tabs defaultValue="basics" className="mt-5">
              <TabsList className="grid w-full grid-cols-6">
                <TabsTrigger value="basics">Basics</TabsTrigger>
                <TabsTrigger value="hero">Hero</TabsTrigger>
                <TabsTrigger value="contact">Contact &amp; Hours</TabsTrigger>
                <TabsTrigger value="media">Media</TabsTrigger>
                <TabsTrigger value="ordering">Ordering &amp; Links</TabsTrigger>
                <TabsTrigger value="visibility">Visibility</TabsTrigger>
              </TabsList>

              <TabsContent value="basics" className="mt-5 grid gap-4 sm:grid-cols-2">
                <Field label="Name"><Input value={editing.name ?? ""} onChange={(e) => set("name", e.target.value)} /></Field>
                <Field label="Slug" hint="Used in the URL, e.g. wandsworth"><Input value={editing.slug ?? ""} onChange={(e) => set("slug", e.target.value)} /></Field>
                <Field label="Area" hint="e.g. Wandsworth"><Input value={editing.area ?? ""} onChange={(e) => set("area", e.target.value)} /></Field>
                <Field label="Postcode"><Input value={editing.postcode ?? ""} onChange={(e) => set("postcode", e.target.value)} /></Field>
                <Field label="Address" className="sm:col-span-2"><Input value={editing.address ?? ""} onChange={(e) => set("address", e.target.value)} /></Field>
                <Field label="Short description" className="sm:col-span-2" hint="Shown on cards and previews. Keep it to 1–2 sentences.">
                  <Textarea rows={2} value={editing.description ?? ""} onChange={(e) => set("description", e.target.value)} />
                </Field>
                <Field label="Full description" className="sm:col-span-2" hint="Longer story shown on the location page. Use blank lines between paragraphs.">
                  <Textarea rows={5} value={editing.full_description ?? ""} onChange={(e) => set("full_description", e.target.value)} />
                </Field>
              </TabsContent>

              <TabsContent value="contact" className="mt-5 grid gap-4 sm:grid-cols-2">
                <Field label="Phone"><Input value={editing.phone ?? ""} onChange={(e) => set("phone", e.target.value)} /></Field>
                <Field label="Email"><Input type="email" value={editing.email ?? ""} onChange={(e) => set("email", e.target.value)} /></Field>
                <Field label="Opening hours" className="sm:col-span-2">
                  <HoursEditor value={editing.opening_hours ?? []} onChange={(v) => set("opening_hours", v)} />
                </Field>
              </TabsContent>

              <TabsContent value="media" className="mt-5 grid gap-4">
                <Field label="Hero image" hint="Used at the top of the location page and as the social share image.">
                  <div className="flex items-center gap-3">
                    {editing.hero_image_url && <img src={editing.hero_image_url} className="h-16 w-24 rounded object-cover" alt="" />}
                    <Input value={editing.hero_image_url ?? ""} onChange={(e) => set("hero_image_url", e.target.value)} placeholder="https://…" />
                    <FileUpload bucket="locations" accept="image/*" onUploaded={(url) => set("hero_image_url", url)} />
                  </div>
                </Field>
                <Field label="Gallery images" hint="One image per line. Use the upload button to add more.">
                  <Textarea
                    rows={4}
                    value={(editing.gallery_image_urls ?? []).join("\n")}
                    onChange={(e) => set("gallery_image_urls", e.target.value.split("\n").map((s) => s.trim()).filter(Boolean))}
                  />
                  <div className="mt-2">
                    <FileUpload
                      bucket="locations"
                      accept="image/*"
                      onUploaded={(url) => set("gallery_image_urls", [...(editing.gallery_image_urls ?? []), url])}
                      label="Add image"
                    />
                  </div>
                </Field>
              </TabsContent>

              <TabsContent value="ordering" className="mt-5 grid gap-4 sm:grid-cols-2">
                <Field label="Google Maps link" className="sm:col-span-2" hint="Used by the Get Directions button."><Input value={editing.maps_link ?? ""} onChange={(e) => set("maps_link", e.target.value)} placeholder="https://maps.google.com/…" /></Field>
                <Field label="Booking link" hint="OpenTable, ResDiary, etc."><Input value={editing.booking_link ?? ""} onChange={(e) => set("booking_link", e.target.value)} placeholder="https://…" /></Field>
                <Field label="Click & Collect URL"><Input value={editing.click_collect_url ?? ""} onChange={(e) => set("click_collect_url", e.target.value)} placeholder="https://…" /></Field>
                <Field label="Deliveroo URL"><Input value={editing.deliveroo_url ?? ""} onChange={(e) => set("deliveroo_url", e.target.value)} placeholder="https://deliveroo.co.uk/…" /></Field>
                <Field label="Just Eat URL"><Input value={editing.justeat_url ?? ""} onChange={(e) => set("justeat_url", e.target.value)} placeholder="https://just-eat.co.uk/…" /></Field>
                <Field label="Uber Eats URL" className="sm:col-span-2"><Input value={editing.ubereats_url ?? ""} onChange={(e) => set("ubereats_url", e.target.value)} placeholder="https://ubereats.com/…" /></Field>
              </TabsContent>

              <TabsContent value="visibility" className="mt-5 grid gap-4 sm:grid-cols-2">
                <Field label="Display order" hint="Lower numbers show first."><Input type="number" value={editing.display_order ?? 0} onChange={(e) => set("display_order", Number(e.target.value))} /></Field>
                <Field label="Active">
                  <label className="flex h-10 items-center gap-2 rounded-md border border-input bg-background px-3 text-sm">
                    <input type="checkbox" checked={!!editing.is_active} onChange={(e) => set("is_active", e.target.checked)} /> Visible on the site
                  </label>
                </Field>
                <Field label="Featured" className="sm:col-span-2" hint="Highlight this location across the site.">
                  <label className="flex h-10 items-center gap-2 rounded-md border border-input bg-background px-3 text-sm">
                    <input type="checkbox" checked={!!editing.is_featured} onChange={(e) => set("is_featured", e.target.checked)} /> Mark as featured
                  </label>
                </Field>
              </TabsContent>
            </Tabs>

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

function Field({
  label, children, className = "", hint,
}: { label: string; children: React.ReactNode; className?: string; hint?: string }) {
  return (
    <div className={className}>
      <Label>{label}</Label>
      <div className="mt-2">{children}</div>
      {hint && <p className="mt-1 text-xs text-muted-foreground">{hint}</p>}
    </div>
  );
}
