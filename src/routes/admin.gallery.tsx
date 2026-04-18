import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { FileUpload } from "@/components/admin/FileUpload";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Trash2, Plus } from "lucide-react";

export const Route = createFileRoute("/admin/gallery")({
  head: () => ({ meta: [{ title: "Gallery — Admin" }, { name: "robots", content: "noindex" }] }),
  component: GalleryAdmin,
});

type G = { id: string; image_url: string; caption: string | null; alt_text: string | null; is_featured: boolean; is_active: boolean; display_order: number };

function GalleryAdmin() {
  const [list, setList] = useState<G[]>([]);
  const [editing, setEditing] = useState<Partial<G> | null>(null);
  async function load() { const { data } = await supabase.from("gallery_images").select("*").order("display_order"); setList((data as G[] | null) ?? []); }
  useEffect(() => { load(); }, []);
  async function save() {
    if (!editing?.image_url) { toast.error("Image required"); return; }
    const { error } = editing.id ? await supabase.from("gallery_images").update(editing).eq("id", editing.id) : await supabase.from("gallery_images").insert(editing as never);
    if (error) toast.error(error.message); else { toast.success("Saved"); setEditing(null); load(); }
  }
  async function remove(id: string) { if (!confirm("Delete?")) return; await supabase.from("gallery_images").delete().eq("id", id); load(); }
  return (
    <AdminLayout>
      <div className="flex items-center justify-between">
        <h1 className="font-serif text-3xl">Gallery</h1>
        <Button onClick={() => setEditing({ is_active: true, is_featured: false, display_order: 0 })}><Plus className="mr-2 h-4 w-4" /> Add image</Button>
      </div>
      <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {list.map((g) => (
          <div key={g.id} className="overflow-hidden rounded-lg border border-border bg-card">
            <img src={g.image_url} alt={g.alt_text ?? ""} className="aspect-square w-full object-cover" />
            <div className="p-3 text-xs text-muted-foreground">{g.caption ?? "—"} {g.is_featured && "· ★"}</div>
            <div className="flex gap-2 p-2"><Button size="sm" variant="outline" onClick={() => setEditing(g)} className="flex-1">Edit</Button><Button size="sm" variant="ghost" onClick={() => remove(g.id)}><Trash2 className="h-4 w-4 text-destructive" /></Button></div>
          </div>
        ))}
      </div>
      {editing && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="w-full max-w-lg rounded-2xl bg-card p-6">
            <h2 className="font-serif text-2xl">{editing.id ? "Edit" : "Add"} image</h2>
            <div className="mt-4 space-y-3">
              <div><Label>Image</Label>
                <div className="mt-2 flex items-center gap-3">
                  {editing.image_url && <img src={editing.image_url} className="h-16 w-16 rounded object-cover" alt="" />}
                  <Input value={editing.image_url ?? ""} onChange={(e) => setEditing({ ...editing, image_url: e.target.value })} />
                  <FileUpload bucket="gallery" accept="image/*" onUploaded={(url) => setEditing({ ...editing, image_url: url })} />
                </div>
              </div>
              <div><Label>Caption</Label><Input className="mt-2" value={editing.caption ?? ""} onChange={(e) => setEditing({ ...editing, caption: e.target.value })} /></div>
              <div><Label>Alt text</Label><Input className="mt-2" value={editing.alt_text ?? ""} onChange={(e) => setEditing({ ...editing, alt_text: e.target.value })} /></div>
              <div className="flex gap-4 text-sm">
                <label className="flex items-center gap-2"><input type="checkbox" checked={!!editing.is_active} onChange={(e) => setEditing({ ...editing, is_active: e.target.checked })} /> Active</label>
                <label className="flex items-center gap-2"><input type="checkbox" checked={!!editing.is_featured} onChange={(e) => setEditing({ ...editing, is_featured: e.target.checked })} /> Featured</label>
              </div>
              <div><Label>Order</Label><Input type="number" className="mt-2" value={editing.display_order ?? 0} onChange={(e) => setEditing({ ...editing, display_order: Number(e.target.value) })} /></div>
            </div>
            <div className="mt-6 flex justify-end gap-2"><Button variant="outline" onClick={() => setEditing(null)}>Cancel</Button><Button onClick={save}>Save</Button></div>
          </div>
        </div>
      )}
    </AdminLayout>
  );
}
