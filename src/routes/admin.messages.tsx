import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { Trash2 } from "lucide-react";

export const Route = createFileRoute("/admin/messages")({
  head: () => ({ meta: [{ title: "Messages — Admin" }, { name: "robots", content: "noindex" }] }),
  component: MessagesAdmin,
});

type M = { id: string; name: string; email: string; phone: string | null; subject: string | null; message: string; created_at: string; is_read: boolean };

function MessagesAdmin() {
  const [list, setList] = useState<M[]>([]);
  async function load() { const { data } = await supabase.from("contact_messages").select("*").order("created_at", { ascending: false }); setList((data as M[] | null) ?? []); }
  useEffect(() => { load(); }, []);
  async function toggle(m: M) { await supabase.from("contact_messages").update({ is_read: !m.is_read }).eq("id", m.id); load(); }
  async function remove(id: string) { if (!confirm("Delete?")) return; await supabase.from("contact_messages").delete().eq("id", id); load(); }
  return (
    <AdminLayout>
      <h1 className="font-serif text-3xl">Contact messages</h1>
      <div className="mt-6 space-y-3">
        {list.length === 0 && <p className="text-muted-foreground">No messages yet.</p>}
        {list.map((m) => (
          <div key={m.id} className={`rounded-lg border bg-card p-4 ${m.is_read ? "border-border" : "border-primary/40"}`}>
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div>
                <p className="font-medium">{m.name} <span className="ml-2 text-xs text-muted-foreground">{m.email}{m.phone ? ` · ${m.phone}` : ""}</span></p>
                {m.subject && <p className="text-sm font-medium text-primary">{m.subject}</p>}
                <p className="text-xs text-muted-foreground">{new Date(m.created_at).toLocaleString()}</p>
              </div>
              <div className="flex gap-2">
                <Button size="sm" variant="outline" onClick={() => toggle(m)}>{m.is_read ? "Mark unread" : "Mark read"}</Button>
                <Button size="sm" variant="ghost" onClick={() => remove(m.id)}><Trash2 className="h-4 w-4 text-destructive" /></Button>
              </div>
            </div>
            <p className="mt-3 whitespace-pre-wrap text-sm text-foreground/90">{m.message}</p>
          </div>
        ))}
      </div>
    </AdminLayout>
  );
}
