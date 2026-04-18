
## Reginè Pizzeria — Website + Admin CMS

A warm, editorial, mobile-first website for a Southern Italian family pizzeria in London, with a full admin area to manage all content. Built on TanStack Start + Tailwind + Lovable Cloud (Supabase) for auth, database, and storage.

### Brand system
- **Colors**: Reginè Red `#B22234`, Crown Gold `#F4A300`, Charcoal `#2C2C2C`, Cream `#FFF8E7`, Olive `#6B8E23`, Terracotta `#D2691E`
- **Type**: Elegant serif headlines (Playfair Display), clean sans body (Inter)
- **Motifs**: Subtle terracotta line-art (basil, tomatoes, wheat, olive branches) at 20–30% opacity as background accents
- **Logo**: Placeholder mark in header/footer/hero — replaceable from Admin → Branding once you upload the file

### Public pages
1. **Home** — Hero with logo + "Southern Italian warmth, served in London." headline, family intro, locations preview, menu CTA, featured gallery, contact CTA
2. **About** — Family story, Southern Italian roots, philosophy, supporting imagery (admin-editable)
3. **Locations** — Dynamic list of all active locations, seeded with **Wandsworth**
4. **Location detail** (`/locations/$slug`) — Hero, address, hours, phone/email, View menu / Directions / Contact buttons, gallery, description
5. **Menus** — Grouped by category, PDF open/download or external link, optionally per-location
6. **Gallery** — Masonry grid + lightbox, captions, optional location filter
7. **Contact** — Form (name, email, phone, subject, message) with success/error states, plus phone/email/address/hours/map

Sticky header with mobile drawer menu, elegant footer with brand summary, contact, quick links.

### Admin area (`/admin`, password-protected via Supabase auth)
- **Dashboard** — Counts (locations, menus, files, images) + quick links
- **Locations Manager** — name, slug, area, address, postcode, phone, email, hours, description, hero image, gallery, maps link, booking link, active toggle, display order
- **Menus Manager** — title, slug, description, category, location(s), PDF upload, external URL, active/featured toggles, order
- **Files Manager** — title, category, file upload, external link, optional location, active toggle
- **Gallery Manager** — image upload, caption, alt text, optional location, featured toggle, order, active toggle
- **About Manager** — headline, intro, full story, images
- **Contact Details Manager** — email, phone, enquiry text, social links, footer text, CTA text
- **Links Manager** — useful links (booking, delivery, maps, Instagram, etc.)
- **Branding** — Upload logo + favicon (replaces the placeholder everywhere)

### Data model (Lovable Cloud / Supabase)
Tables: `locations`, `menus`, `files`, `gallery_images`, `links`, `about_content` (singleton), `site_settings` (singleton with branding + contact), `contact_messages`, `user_roles` (admin role via separate table — never on profiles), plus `has_role()` security-definer function.

Storage buckets: `branding` (public), `locations` (public), `menus` (public), `gallery` (public), `files` (public).

RLS: public read on active rows; insert/update/delete restricted to users with `admin` role. Contact form inserts allowed for anyone; only admins can read.

### SEO & performance
- Per-route `head()` with title, description, OG tags (location pages get local-SEO titles like "Reginè Pizzeria Wandsworth — Southern Italian pizza in Wandsworth, London")
- Hero image used as `og:image` per route
- Semantic HTML, alt text on all images, accessible forms
- Lazy-loaded gallery images, sitemap, robots.txt

### Initial seed
- Wandsworth location (placeholder address/hours — editable)
- Sample about copy, contact placeholders, example menu category, gallery placeholders
- First admin user created on first signup at `/admin/login` (you'll set the email + password)

### Deliverables at the end
1. SQL schema summary
2. Setup notes (how to log into admin, replace logo, edit content)
3. Env vars (auto-configured by Lovable Cloud — none needed manually)
4. Storage bucket policies summary
5. Editable content map
