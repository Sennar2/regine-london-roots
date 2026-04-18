import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Trash2, Plus } from "lucide-react";

export const Route = createFileRoute("/admin/links")({
  head: () => ({ meta: [{ title: "Links — Admin" }, { name: "robots", content: "noindex" }] }),
  component: LinksAdmin,
});

type L = { id: string; label: string; url: string; category: string | null; is_active: boolean; display_order: number };

function LinksAdmin() {
  const [list, setList] = useState<L[]>([]);
  const [editing, setEditing] = useState<Partial<L> | null>(null);
  async function load() { const { data } = await supabase.from("links").select("*").order("display_order"); setList((data as L[] | null) ?? []); }
  useEffect(() => { load(); }, []);
  async function save() {
    if (!editing?.label || !editing?.url) { toast.error("Label and URL required"); return; }
    const { error } = editing.id ? await supabase.from("links").update(editing).eq("id", editing.id) : await supabase.from("links").insert(editing as never);
    if (error) toast.error(error.message); else { toast.success("Saved"); setEditing(null); load(); }
  }
  async function remove(id: string) { if (!confirm("Delete?")) return; await supabase.from("links").delete().eq("id", id); load(); }
  return (
    <AdminLayout>
      <div className="flex items-center justify-between">
        <h1 className="font-serif text-3xl">Useful links</h1>
        <Button onClick={() => setEditing({ is_active: true, display_order: 0 })}><Plus className="mr-2 h-4 w-4" /> New link</Button>
      </div>
      <div className="mt-6 space-y-3">
        {list.map((l) => (
          <div key={l.id} className="flex items-center justify-between rounded-lg border border-border bg-card p-4">
            <div><p className="font-medium">{l.label}</p><p className="text-xs text-muted-foreground">{l.url}</p></div>
            <div className="flex gap-2"><Button size="sm" variant="outline" onClick={() => setEditing(l)}>Edit</Button><Button size="sm" variant="ghost" onClick={() => remove(l.id)}><Trash2 className="h-4 w-4 text-destructive" /></Button></div>
          </div>
        ))}
      </div>
      {editing && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="w-full max-w-md rounded-2xl bg-card p-6">
            <h2 className="font-serif text-2xl">{editing.id ? "Edit" : "New"} link</h2>
            <div className="mt-4 space-y-3">
              <div><Label>Label</Label><Input className="mt-2" value={editing.label ?? ""} onChange={(e) => setEditing({ ...editing, label: e.target.value })} /></div>
              <div><Label>URL</Label><Input className="mt-2" value={editing.url ?? ""} onChange={(e) => setEditing({ ...editing, url: e.target.value })} /></div>
              <div><Label>Category</Label><Input className="mt-2" value={editing.category ?? ""} onChange={(e) => setEditing({ ...editing, category: e.target.value })} /></div>
              <div><Label>Order</Label><Input type="number" className="mt-2" value={editing.display_order ?? 0} onChange={(e) => setEditing({ ...editing, display_order: Number(e.target.value) })} /></div>
              <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={!!editing.is_active} onChange={(e) => setEditing({ ...editing, is_active: e.target.checked })} /> Active</label>
            </div>
            <div className="mt-6 flex justify-end gap-2"><Button variant="outline" onClick={() => setEditing(null)}>Cancel</Button><Button onClick={save}>Save</Button></div>
          </div>
        </div>
      )}
    </AdminLayout>
  );
}
