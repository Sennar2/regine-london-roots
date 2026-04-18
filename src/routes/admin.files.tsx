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

export const Route = createFileRoute("/admin/files")({
  head: () => ({ meta: [{ title: "Files — Admin" }, { name: "robots", content: "noindex" }] }),
  component: FilesAdmin,
});

type F = { id: string; title: string; category: string | null; file_url: string | null; external_url: string | null; is_active: boolean };

function FilesAdmin() {
  const [list, setList] = useState<F[]>([]);
  const [editing, setEditing] = useState<Partial<F> | null>(null);
  async function load() { const { data } = await supabase.from("files").select("*").order("display_order"); setList((data as F[] | null) ?? []); }
  useEffect(() => { load(); }, []);
  async function save() {
    if (!editing?.title) { toast.error("Title required"); return; }
    const { error } = editing.id ? await supabase.from("files").update(editing).eq("id", editing.id) : await supabase.from("files").insert(editing as never);
    if (error) toast.error(error.message); else { toast.success("Saved"); setEditing(null); load(); }
  }
  async function remove(id: string) {
    if (!confirm("Delete?")) return;
    await supabase.from("files").delete().eq("id", id); load();
  }
  return (
    <AdminLayout>
      <div className="flex items-center justify-between">
        <h1 className="font-serif text-3xl">Files</h1>
        <Button onClick={() => setEditing({ is_active: true })}><Plus className="mr-2 h-4 w-4" /> New file</Button>
      </div>
      <div className="mt-6 space-y-3">
        {list.map((f) => (
          <div key={f.id} className="flex items-center justify-between rounded-lg border border-border bg-card p-4">
            <div><p className="font-medium">{f.title}</p><p className="text-xs text-muted-foreground">{f.category ?? "—"}</p></div>
            <div className="flex gap-2"><Button size="sm" variant="outline" onClick={() => setEditing(f)}>Edit</Button><Button size="sm" variant="ghost" onClick={() => remove(f.id)}><Trash2 className="h-4 w-4 text-destructive" /></Button></div>
          </div>
        ))}
      </div>
      {editing && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="w-full max-w-lg rounded-2xl bg-card p-6">
            <h2 className="font-serif text-2xl">{editing.id ? "Edit" : "New"} file</h2>
            <div className="mt-4 space-y-3">
              <div><Label>Title</Label><Input className="mt-2" value={editing.title ?? ""} onChange={(e) => setEditing({ ...editing, title: e.target.value })} /></div>
              <div><Label>Category</Label><Input className="mt-2" value={editing.category ?? ""} onChange={(e) => setEditing({ ...editing, category: e.target.value })} /></div>
              <div><Label>File URL</Label><div className="mt-2 flex gap-2"><Input value={editing.file_url ?? ""} onChange={(e) => setEditing({ ...editing, file_url: e.target.value })} /><FileUpload bucket="files" onUploaded={(url) => setEditing({ ...editing, file_url: url })} /></div></div>
              <div><Label>External URL</Label><Input className="mt-2" value={editing.external_url ?? ""} onChange={(e) => setEditing({ ...editing, external_url: e.target.value })} /></div>
              <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={!!editing.is_active} onChange={(e) => setEditing({ ...editing, is_active: e.target.checked })} /> Active</label>
            </div>
            <div className="mt-6 flex justify-end gap-2"><Button variant="outline" onClick={() => setEditing(null)}>Cancel</Button><Button onClick={save}>Save</Button></div>
          </div>
        </div>
      )}
    </AdminLayout>
  );
}
