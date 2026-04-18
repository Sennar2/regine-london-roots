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

export const Route = createFileRoute("/admin/menus")({
  head: () => ({ meta: [{ title: "Menus — Admin" }, { name: "robots", content: "noindex" }] }),
  component: MenusAdmin,
});

type Menu = { id: string; title: string; slug: string; description: string | null; category: string | null; location_id: string | null; pdf_url: string | null; external_url: string | null; is_active: boolean; is_featured: boolean; display_order: number };
type Loc = { id: string; name: string };

function MenusAdmin() {
  const [list, setList] = useState<Menu[]>([]);
  const [locs, setLocs] = useState<Loc[]>([]);
  const [editing, setEditing] = useState<Partial<Menu> | null>(null);

  async function load() {
    const [{ data: m }, { data: l }] = await Promise.all([
      supabase.from("menus").select("*").order("display_order"),
      supabase.from("locations").select("id,name").order("name"),
    ]);
    setList((m as Menu[] | null) ?? []);
    setLocs((l as Loc[] | null) ?? []);
  }
  useEffect(() => { load(); }, []);

  async function save() {
    if (!editing?.title || !editing.slug) { toast.error("Title and slug required"); return; }
    const { error } = editing.id
      ? await supabase.from("menus").update(editing).eq("id", editing.id)
      : await supabase.from("menus").insert(editing as never);
    if (error) { toast.error(error.message); return; }
    toast.success("Saved"); setEditing(null); load();
  }
  async function remove(id: string) {
    if (!confirm("Delete?")) return;
    const { error } = await supabase.from("menus").delete().eq("id", id);
    if (error) toast.error(error.message); else { toast.success("Deleted"); load(); }
  }

  return (
    <AdminLayout>
      <div className="flex items-center justify-between">
        <h1 className="font-serif text-3xl">Menus</h1>
        <Button onClick={() => setEditing({ is_active: true, is_featured: false, display_order: 0 })}><Plus className="mr-2 h-4 w-4" /> New menu</Button>
      </div>
      <div className="mt-6 space-y-3">
        {list.map((m) => (
          <div key={m.id} className="flex items-center justify-between rounded-lg border border-border bg-card p-4">
            <div>
              <p className="font-medium">{m.title}</p>
              <p className="text-xs text-muted-foreground">{m.category ?? "—"} · {m.is_active ? "Active" : "Hidden"}</p>
            </div>
            <div className="flex gap-2">
              <Button size="sm" variant="outline" onClick={() => setEditing(m)}>Edit</Button>
              <Button size="sm" variant="ghost" onClick={() => remove(m.id)}><Trash2 className="h-4 w-4 text-destructive" /></Button>
            </div>
          </div>
        ))}
      </div>

      {editing && (
        <div className="fixed inset-0 z-50 flex items-start justify-center overflow-auto bg-black/40 p-4">
          <div className="my-8 w-full max-w-2xl rounded-2xl bg-card p-6 shadow-xl">
            <h2 className="font-serif text-2xl">{editing.id ? "Edit" : "New"} menu</h2>
            <div className="mt-4 grid gap-4 sm:grid-cols-2">
              <F label="Title"><Input value={editing.title ?? ""} onChange={(e) => setEditing({ ...editing, title: e.target.value })} /></F>
              <F label="Slug"><Input value={editing.slug ?? ""} onChange={(e) => setEditing({ ...editing, slug: e.target.value })} /></F>
              <F label="Category"><Input placeholder="Pizza, Drinks, Specials…" value={editing.category ?? ""} onChange={(e) => setEditing({ ...editing, category: e.target.value })} /></F>
              <F label="Location">
                <select className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm" value={editing.location_id ?? ""} onChange={(e) => setEditing({ ...editing, location_id: e.target.value || null })}>
                  <option value="">All locations</option>
                  {locs.map((l) => <option key={l.id} value={l.id}>{l.name}</option>)}
                </select>
              </F>
              <F label="Description" className="sm:col-span-2"><Textarea rows={2} value={editing.description ?? ""} onChange={(e) => setEditing({ ...editing, description: e.target.value })} /></F>
              <F label="PDF URL" className="sm:col-span-2">
                <div className="flex items-center gap-2">
                  <Input value={editing.pdf_url ?? ""} onChange={(e) => setEditing({ ...editing, pdf_url: e.target.value })} />
                  <FileUpload bucket="menus" accept="application/pdf" onUploaded={(url) => setEditing({ ...editing, pdf_url: url })} />
                </div>
              </F>
              <F label="External URL" className="sm:col-span-2"><Input value={editing.external_url ?? ""} onChange={(e) => setEditing({ ...editing, external_url: e.target.value })} /></F>
              <F label="Display order"><Input type="number" value={editing.display_order ?? 0} onChange={(e) => setEditing({ ...editing, display_order: Number(e.target.value) })} /></F>
              <F label="Flags">
                <div className="flex gap-4 text-sm">
                  <label className="flex items-center gap-2"><input type="checkbox" checked={!!editing.is_active} onChange={(e) => setEditing({ ...editing, is_active: e.target.checked })} /> Active</label>
                  <label className="flex items-center gap-2"><input type="checkbox" checked={!!editing.is_featured} onChange={(e) => setEditing({ ...editing, is_featured: e.target.checked })} /> Featured</label>
                </div>
              </F>
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

function F({ label, children, className = "" }: { label: string; children: React.ReactNode; className?: string }) {
  return <div className={className}><Label>{label}</Label><div className="mt-2">{children}</div></div>;
}
