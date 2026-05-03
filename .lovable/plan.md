## Reginè — Launch Mode, WhatsApp, Popups & Typography Refresh

A focused update to the existing project. Nothing existing is removed. Public visitors see only a refined launch/countdown screen until launch mode is turned off; admin (and a `?preview=full` toggle) bypass it.

---

### 1. Database changes (one migration)

Extend existing tables — no rebuild.

**`site_settings`** — add columns:
- `launch_mode_enabled boolean default false`
- `launch_title text` (default `"Reginè arriviamo."`)
- `launch_subtitle text` (default `"Wandsworth"`)
- `launch_date timestamptz` (default `2026-06-01 00:00:00+00`)
- `launch_countdown_enabled boolean default true`
- `launch_primary_label text`, `launch_primary_href text`
- `launch_secondary_label text`, `launch_secondary_href text`
- `launch_whatsapp_enabled boolean default true`
- `launch_instagram_enabled boolean default true`
- `launch_background_url text`
- `launch_dismissible boolean default false`
- `whatsapp_number text`, `whatsapp_url text`
- `whatsapp_default_message text`, `whatsapp_button_label text` (default `"Order via WhatsApp"`)

**`locations`** — add columns:
- `whatsapp_number text`, `whatsapp_url text`, `whatsapp_message text`

**New table `site_popups`** (with RLS — public read of active rows, admins manage):
- `id uuid pk`, `enabled bool`, `popup_type text` (`'standard' | 'fullscreen'`)
- `title`, `subtitle`, `message`, `supporting_text`
- `countdown_enabled bool`, `countdown_target timestamptz`
- `primary_label/href`, `secondary_label/href`
- `whatsapp_cta_enabled bool`
- `dismissible bool`, `background_url text`, `overlay_opacity numeric default 0.6`
- `start_at timestamptz`, `end_at timestamptz`
- `display_order int`, `created_at`, `updated_at`

---

### 2. Typography refinement

Replace the current Playfair + Inter pairing with a more elegant, premium-casual stack:

- **Headings:** **Cormorant Garamond** (500/600) — refined Italian editorial feel, replaces Playfair (which felt too decorative).
- **Body:** **Inter** kept, but tightened (300/400/500 only, no 700 in body).
- **Eyebrows / small caps:** Inter 500 with `tracking-[0.22em]` and `uppercase`.

Adjustments in `src/styles.css` and `__root.tsx` Google Fonts link:
- New font CSS vars `--font-serif: "Cormorant Garamond"`, weight defaults
- Globally: `h1–h3` weight `500`, `letter-spacing -0.01em`, `line-height 1.05`
- Body `font-feature-settings "ss01","cv11"`, line-height 1.65
- Buttons: tighter tracking, lighter weight (500), smaller default radius for a more editorial feel

No component rewrite needed — Tailwind `font-serif` automatically picks up the new var.

---

### 3. WhatsApp ordering

**Helper** `src/lib/whatsapp.ts`:
- Builds a `wa.me/<digits>?text=<encoded message>` URL from a number+message, falling back to a raw URL field.

**Reusable component** `src/components/site/WhatsAppCTA.tsx`:
- Branded button using the WhatsApp icon (lucide `MessageCircle`) styled in brand-olive/cream — not the cliched bright green.
- Props: `number`, `url`, `message`, `label`.

**Where it appears:**
- Header (desktop + mobile) when a site-wide WhatsApp is configured.
- Locations detail page — uses location-specific values, falls back to site-wide.
- Launch page — when `launch_whatsapp_enabled`.

**Admin:**
- `/admin/settings` gets a "WhatsApp" card with number, url, default message, button label.
- `/admin/locations` editor gets per-location WhatsApp number / url / message fields.

---

### 4. Popup Manager (`/admin/popups`)

New admin page with list + editor for `site_popups`:
- Toggle enabled, pick type (standard / fullscreen), set countdown, schedule window, CTAs, optional background + overlay opacity.
- Saved as rows in `site_popups`.

**Frontend renderer** `src/components/site/SitePopup.tsx`:
- Loads first enabled popup whose `start_at`/`end_at` window is current.
- `standard`: centered modal with dismiss (uses existing Dialog UI).
- `fullscreen`: edge-to-edge overlay (used for non-launch announcements; launch mode itself uses the dedicated launch screen).
- Dismissal stored in `localStorage` per popup id when `dismissible`.

Mounted inside `PublicLayout` so it shows across all public pages once launch mode is OFF.

---

### 5. Launch / Countdown screen

**Component** `src/components/site/LaunchScreen.tsx`:
- Full-viewport editorial layout: logo top-center, large Cormorant headline `Reginè arriviamo.`, gold hairline divider, location `Wandsworth`, date `01 / 06 / 2026`, live countdown (days · hours · minutes · seconds in monospace tabular numbers).
- Optional CTAs row: Contact, Instagram, WhatsApp — all opt-in via settings.
- Subtle grain/motif background using existing `.bg-motif`, brand-cream base, terracotta and gold accents.
- Mobile-first stack, desktop centered editorial composition.
- Reads its content from `site_settings.launch_*` fields.

**Admin** `/admin/launch`: dedicated page editing all `launch_*` fields (toggle, title, subtitle, date picker, countdown toggle, CTA labels/links, WhatsApp/Instagram toggles, background image, dismissible, preview note). Default seed values match the brief.

---

### 6. Launch mode gate + admin/owner bypass

**Logic in `PublicLayout`** (`src/components/site/PublicLayout.tsx`):
1. Fetch `site_settings.launch_mode_enabled` once.
2. Read auth state via existing `useAdminAuth`. If `isAdmin === true` → render full site.
3. Read `?preview=full` from URL — if present, set `regine_preview=full` cookie/localStorage for 7 days and bypass.
4. Otherwise, if `launch_mode_enabled` → render `<LaunchScreen />` only (no header/footer).
5. Otherwise render full site as today.

**Admin routes** are unaffected — they use `AdminLayout`, not `PublicLayout`, so `/admin/*` always works.

**Bypass summary:**
- Logged-in admin → always sees full site.
- `?preview=full` once → cookie set, full site visible for 7 days on that device.
- `?preview=launch` → forces launch screen for testing (admin only).
- Everyone else → launch screen only.

---

### 7. Files added / changed

**New:**
- `src/components/site/LaunchScreen.tsx`
- `src/components/site/SitePopup.tsx`
- `src/components/site/WhatsAppCTA.tsx`
- `src/lib/whatsapp.ts`
- `src/lib/launch-mode.ts` (preview cookie helpers)
- `src/routes/admin.launch.tsx`
- `src/routes/admin.popups.tsx`

**Edited:**
- `supabase` migration (schema additions + new table + RLS + seed defaults)
- `src/styles.css` (typography vars, weight/tracking)
- `src/routes/__root.tsx` (new Google Fonts link for Cormorant Garamond + Inter)
- `src/components/site/PublicLayout.tsx` (launch gate + popup mount)
- `src/components/site/Header.tsx` (WhatsApp CTA)
- `src/components/admin/AdminLayout.tsx` (nav links: Launch, Popups)
- `src/routes/admin.settings.tsx` (WhatsApp card)
- `src/routes/admin.locations.tsx` (per-location WhatsApp fields)
- `src/routes/locations.$slug.tsx` (WhatsApp CTA in order-online section)
- `src/lib/site.ts` (extend `SiteSettings` type)

---

### 8. Defaults seeded by migration

```text
launch_mode_enabled = true
launch_title        = "Reginè arriviamo."
launch_subtitle     = "Wandsworth"
launch_date         = 2026-06-01 00:00:00+00
launch_countdown_enabled = true
launch_whatsapp_enabled  = true
launch_instagram_enabled = true
whatsapp_button_label    = "Order via WhatsApp"
```

So immediately after deploy: public sees the launch screen; you (admin) and `?preview=full` see the full site.

---

### Deliverables (provided after implementation)

1. Typography summary
2. WhatsApp features summary
3. Popup/launch admin summary
4. Launch mode logic
5. Admin/owner bypass explanation
6. Preview mode explanation (`?preview=full`, `?preview=launch`)
7. Confirmation public sees only launch
8. Confirmation admin still sees full site + `/admin`
9. List of all new editable fields
