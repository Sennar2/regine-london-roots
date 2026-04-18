import { useState } from "react";
import { Upload } from "lucide-react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export function FileUpload({ bucket, accept, onUploaded, label = "Upload" }: { bucket: string; accept?: string; onUploaded: (publicUrl: string, path: string) => void; label?: string }) {
  const [busy, setBusy] = useState(false);
  return (
    <label className="inline-flex cursor-pointer items-center gap-2">
      <input type="file" accept={accept} className="hidden" onChange={async (e) => {
        const file = e.target.files?.[0];
        if (!file) return;
        setBusy(true);
        const path = `${Date.now()}-${file.name.replace(/[^a-zA-Z0-9._-]/g, "_")}`;
        const { error } = await supabase.storage.from(bucket).upload(path, file, { cacheControl: "3600", upsert: false });
        if (error) { toast.error(error.message); setBusy(false); return; }
        const { data } = supabase.storage.from(bucket).getPublicUrl(path);
        onUploaded(data.publicUrl, path);
        toast.success("Uploaded");
        setBusy(false);
        e.target.value = "";
      }} />
      <Button asChild type="button" variant="outline" size="sm" disabled={busy}>
        <span><Upload className="mr-2 h-4 w-4" /> {busy ? "Uploading…" : label}</span>
      </Button>
    </label>
  );
}
