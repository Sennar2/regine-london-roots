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

export const Route = createFileRoute("/admin/about")({
  head: () => ({ meta: [{ title: "About — Admin" }, { name: "robots", content: "noindex" }] }),
  component: AboutAdmin,
});

type A = { id: number; headline: string | null; intro: string | null; story: string | null; image_urls: string[] | null };

function AboutAdmin() {
  const [a, setA] = useState<A>({ id: 1, headline: "", intro: "", story: "", image_urls: [] });
  useEffect(() => { supabase.from("about_content").select("*").eq("id", 1).maybeSingle().then(({ data }) => { if (data) setA(data as A); }); }, []);
  async function save() {
    const { error } = await supabase.from("about_content").update({ headline: a.headline, intro: a.intro, story: a.story, image_urls: a.image_urls }).eq("id", 1);
    if (error) toast.error(error.message); else toast.success("Saved");
  }
  return (
    <AdminLayout>
      <h1 className="font-serif text-3xl">About content</h1>
      <div className="mt-6 max-w-3xl space-y-4 rounded-2xl border border-border bg-card p-6">
        <div><Label>Headline</Label><Input className="mt-2" value={a.headline ?? ""} onChange={(e) => setA({ ...a, headline: e.target.value })} /></div>
        <div><Label>Intro</Label><Textarea rows={3} className="mt-2" value={a.intro ?? ""} onChange={(e) => setA({ ...a, intro: e.target.value })} /></div>
        <div><Label>Full story</Label><Textarea rows={10} className="mt-2" value={a.story ?? ""} onChange={(e) => setA({ ...a, story: e.target.value })} /></div>
        <div>
          <Label>Images</Label>
          <Textarea rows={3} className="mt-2" value={(a.image_urls ?? []).join("\n")} onChange={(e) => setA({ ...a, image_urls: e.target.value.split("\n").map((s) => s.trim()).filter(Boolean) })} />
          <div className="mt-2"><FileUpload bucket="branding" accept="image/*" onUploaded={(url) => setA({ ...a, image_urls: [...(a.image_urls ?? []), url] })} label="Add image" /></div>
        </div>
        <Button onClick={save}>Save</Button>
      </div>
    </AdminLayout>
  );
}
