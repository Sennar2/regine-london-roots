import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Logo } from "@/components/site/Logo";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export const Route = createFileRoute("/admin/login")({
  head: () => ({ meta: [{ title: "Admin — Reginè Pizzeria" }, { name: "robots", content: "noindex,nofollow" }] }),
  component: AdminLogin,
});

function AdminLogin() {
  const navigate = useNavigate();
  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    supabase.auth.getSession().then(async ({ data }) => {
      if (data.session) {
        const { data: r } = await supabase.from("user_roles").select("role").eq("user_id", data.session.user.id).eq("role", "admin").maybeSingle();
        if (r) navigate({ to: "/admin", replace: true });
      }
    });
  }, [navigate]);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    if (mode === "signup") {
      const redirectUrl = `${window.location.origin}/admin`;
      const { error } = await supabase.auth.signUp({ email, password, options: { emailRedirectTo: redirectUrl } });
      setBusy(false);
      if (error) { toast.error(error.message); return; }
      toast.success("Account created. You're now the admin.");
      navigate({ to: "/admin" });
    } else {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      setBusy(false);
      if (error) { toast.error(error.message); return; }
      navigate({ to: "/admin" });
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-motif px-4">
      <div className="w-full max-w-sm rounded-2xl border border-border bg-card p-8 shadow-xl">
        <div className="flex justify-center"><Logo className="h-14" /></div>
        <h1 className="mt-6 text-center font-serif text-2xl">Admin {mode === "signup" ? "Sign up" : "Sign in"}</h1>
        <p className="mt-1 text-center text-xs text-muted-foreground">{mode === "signup" ? "Create the first admin account." : "Manage your pizzeria."}</p>
        <form onSubmit={submit} className="mt-6 space-y-4">
          <div>
            <Label htmlFor="email">Email</Label>
            <Input id="email" type="email" required value={email} onChange={(e) => setEmail(e.target.value)} className="mt-2" />
          </div>
          <div>
            <Label htmlFor="password">Password</Label>
            <Input id="password" type="password" required minLength={6} value={password} onChange={(e) => setPassword(e.target.value)} className="mt-2" />
          </div>
          <Button type="submit" className="w-full bg-primary text-primary-foreground" disabled={busy}>{busy ? "…" : mode === "signup" ? "Create account" : "Sign in"}</Button>
        </form>
        <button onClick={() => setMode(mode === "signin" ? "signup" : "signin")} className="mt-4 w-full text-center text-xs text-muted-foreground hover:text-primary">
          {mode === "signin" ? "First time? Create the admin account" : "Already have an account? Sign in"}
        </button>
        <Link to="/" className="mt-6 block text-center text-xs text-muted-foreground hover:text-primary">← Back to site</Link>
      </div>
    </div>
  );
}
