
Quick scan: hero currently uses imported `heroPizza` asset and reads `brand_tagline` from `site_settings`. Need to add hero fields to `site_settings`, expose them in admin, and render dynamically on home with a contrast fix.

Existing `site_settings` already has `logo_url`, `brand_tagline`, etc. I'll extend it rather than add a new table.

Hero contrast: current heading is cream on dark image overlay (actually readable), but user reports gold/yellow look — likely the gold accent line + tagline italic feels too light. Plan: keep image with darker overlay, headline in cream (white) with stronger weight, OR switch to cream-bg variant if no image. Per user's explicit ask: heading must use Charcoal #2C2C2C or Reginè Red #B22234, NOT gold/cream. So redesign hero with cream background + dark text by default, with hero image as a side panel rather than full-bleed background. This gives charcoal text on cream — high contrast, premium editorial.

## Plan — Admin-Managed Homepage Hero + Contrast Fix

### 1. Database (migration)
Add to `site_settings`:
- `hero_image_url text`
- `hero_eyebrow text` (e.g. "Family pizzeria · London")
- `hero_headline text`
- `hero_subheading text`
- `hero_cta_primary_label text`, `hero_cta_primary_href text`
- `hero_cta_secondary_label text`, `hero_cta_secondary_href text`

No data loss. All nullable. Existing `brand_tagline` kept as fallback for `hero_headline`.

### 2. Admin — new "Homepage Hero" card in `admin.settings.tsx`
Fields with FileUpload (bucket: `branding`) for hero image + text inputs for the rest. Includes preview thumbnail and "remove image" button.

### 3. Homepage hero redesign (`src/routes/index.tsx`)

New editorial split layout (replaces current full-bleed dark hero):
- **Left**: cream background, charcoal headline (serif, bold, large), gold-accented eyebrow kicker, charcoal-muted subheading, two CTAs (Red primary + outline secondary)
- **Right**: hero image (admin-managed, fallback to bundled `heroPizza`) in a rounded frame with subtle terracotta motif accent
- Mobile: stacks image-on-top, text below, all centered
- Heading uses `text-brand-charcoal` (#2C2C2C), weight 600, tighter leading
- Eyebrow remains gold but small (already accent-only — passes the "gold as accent only" rule)
- Removes the gold italic tagline line that read as faint/yellow

Dynamic content:
- `hero_headline` → falls back to `brand_tagline` → falls back to "Southern Italian warmth, served in London."
- `hero_image_url` → falls back to imported `heroPizza`
- CTAs default to "View Menus" → `/menus` and "Find Us" → `/locations` if not set

### 4. Site settings type
Extend `SiteSettings` in `src/lib/site.ts` with the new fields.

### 5. Files touched
- **New migration**: adds 7 columns to `site_settings`
- **Modified**: `src/routes/admin.settings.tsx` (new Hero card), `src/routes/index.tsx` (new hero layout + dynamic data), `src/lib/site.ts` (type)

### Deliverables
1. Hero fixes summary (contrast, typography, layout)
2. Admin fields added (image + 6 text fields)
3. Schema change (7 new columns on `site_settings`)
4. Confirmation hero is fully admin-managed with sensible fallbacks
