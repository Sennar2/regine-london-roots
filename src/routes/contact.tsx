import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { z } from "zod";
import { Phone, Mail, MapPin, Clock } from "lucide-react";
import { PublicLayout } from "@/components/site/PublicLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";
import { fetchSiteSettings, type SiteSettings } from "@/lib/site";
import { toast } from "sonner";

export const Route = createFileRoute("/contact")({
  head: () => ({
    meta: [
      { title: "Contact — Reginè Pizzeria" },
      { name: "description", content: "Get in touch with Reginè Pizzeria. Bookings, private events, or just to say ciao." },
      { property: "og:title", content: "Contact — Reginè Pizzeria" },
      { property: "og:description", content: "Bookings, enquiries and private events at Reginè Pizzeria." },
    ],
  }),
  component: ContactPage,
});

const schema = z.object({
  name: z.string().trim().min(1, "Please enter your name").max(120),
  email: z.string().trim().email("Enter a valid email").max(200),
  phone: z.string().trim().max(40).optional().or(z.literal("")),
  subject: z.string().trim().max(200).optional().or(z.literal("")),
  message: z.string().trim().min(1, "Please write a message").max(5000),
});

function ContactPage() {
  const [settings, setSettings] = useState<SiteSettings | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({ name: "", email: "", phone: "", subject: "", message: "" });

  useEffect(() => { fetchSiteSettings().then(setSettings); }, []);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    const parsed = schema.safeParse(form);
    if (!parsed.success) {
      toast.error(parsed.error.issues[0].message);
      return;
    }
    setSubmitting(true);
    const { error } = await supabase.from("contact_messages").insert({
      name: parsed.data.name,
      email: parsed.data.email,
      phone: parsed.data.phone || null,
      subject: parsed.data.subject || null,
      message: parsed.data.message,
    });
    setSubmitting(false);
    if (error) {
      toast.error("Sorry — we couldn't send your message. Please try again.");
      return;
    }
    toast.success("Grazie! We've received your message and will be in touch soon.");
    setForm({ name: "", email: "", phone: "", subject: "", message: "" });
  }

  return (
    <PublicLayout>
      <section className="bg-motif">
        <div className="mx-auto max-w-4xl px-4 py-20 text-center sm:px-6 lg:px-8">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-primary">Contact</p>
          <h1 className="mt-4 font-serif text-4xl font-semibold sm:text-5xl text-balance">Say ciao</h1>
          {settings?.enquiry_text && <p className="mx-auto mt-5 max-w-xl text-muted-foreground">{settings.enquiry_text}</p>}
        </div>
      </section>
      <section>
        <div className="mx-auto grid max-w-6xl gap-12 px-4 pb-24 sm:px-6 lg:grid-cols-5 lg:px-8">
          <form onSubmit={onSubmit} className="lg:col-span-3 space-y-5 rounded-2xl border border-border bg-card p-6 sm:p-8">
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <Label htmlFor="name">Name</Label>
                <Input id="name" required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="mt-2" maxLength={120} />
              </div>
              <div>
                <Label htmlFor="email">Email</Label>
                <Input id="email" type="email" required value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} className="mt-2" maxLength={200} />
              </div>
              <div>
                <Label htmlFor="phone">Phone (optional)</Label>
                <Input id="phone" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} className="mt-2" maxLength={40} />
              </div>
              <div>
                <Label htmlFor="subject">Subject</Label>
                <Input id="subject" value={form.subject} onChange={(e) => setForm({ ...form, subject: e.target.value })} className="mt-2" maxLength={200} />
              </div>
            </div>
            <div>
              <Label htmlFor="message">Message</Label>
              <Textarea id="message" required rows={6} value={form.message} onChange={(e) => setForm({ ...form, message: e.target.value })} className="mt-2" maxLength={5000} />
            </div>
            <Button type="submit" disabled={submitting} className="bg-primary text-primary-foreground">
              {submitting ? "Sending…" : "Send message"}
            </Button>
          </form>
          <aside className="lg:col-span-2 space-y-4">
            <div className="rounded-2xl border border-border bg-card p-6">
              <h3 className="font-serif text-xl">Reach us</h3>
              <ul className="mt-4 space-y-3 text-sm">
                {settings?.contact_phone && <li className="flex items-center gap-2"><Phone className="h-4 w-4 text-primary" /> <a href={`tel:${settings.contact_phone}`} className="hover:text-primary">{settings.contact_phone}</a></li>}
                {settings?.contact_email && <li className="flex items-center gap-2"><Mail className="h-4 w-4 text-primary" /> <a href={`mailto:${settings.contact_email}`} className="hover:text-primary">{settings.contact_email}</a></li>}
                {settings?.address && <li className="flex items-start gap-2"><MapPin className="mt-0.5 h-4 w-4 text-primary" /> {settings.address}</li>}
                {settings?.hours_summary && <li className="flex items-start gap-2"><Clock className="mt-0.5 h-4 w-4 text-primary" /> {settings.hours_summary}</li>}
              </ul>
            </div>
          </aside>
        </div>
      </section>
    </PublicLayout>
  );
}
