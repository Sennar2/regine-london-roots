

## Reginè Pizzeria — Location Page Hero Fix

Bringing the location detail page up to the same premium, admin-managed standard as the homepage hero. Fixes contrast, duplicated title bug, and adds per-location editorial controls.

### 1. Bug fix — duplicated title

Current code renders `Reginè {l.name}` while admin data already stores names like "Reginè Wandsworth", producing **"Reginè Reginè Wandsworth"**. Fix:
- Use the location `name` as the source of truth (admin enters the full display name e.g. "Reginè Wandsworth")
- Title renders as `{hero_title ?? name}` — no hard-coded "Reginè" prefix
- Same fix applied in the JSON-LD schema, page `<title>`, and gallery section heading

### 2. Database — extend `locations`

Migration adds 4 nullable columns (no data loss):
- `hero_eyebrow text` — small kicker (defaults to `area`)
- `hero_title text` — overrides display name in hero only
- `hero_subtitle text` — overrides address line in hero only
- `hero_cta_label text`, `hero_cta_href text` — optional extra CTA

`hero_image_url` already exists per location — kept as-is.

### 3. Location hero redesign (`src/routes/locations.$slug.tsx`)

Replaces dark full-bleed overlay with the same editorial split style as the homepage:

**Desktop (lg+)**: 2-column grid
- **Left**: cream background, charcoal heading, gold eyebrow kicker, address/area, CTA group (View menu = Red primary, Get directions = outline secondary, Book a table = gold accent if present, optional admin CTA)
- **Right**: location hero image in rounded frame with terracotta motif accent

**Mobile**: image stacked on top in 16:9 frame, text below, CTAs full-width stacked

Typography:
- Heading: serif, `text-brand-charcoal`, font-semibold, balanced line-height
- Eyebrow: small uppercase tracked gold (accent only, passes contrast as small text)
- Address/subtitle: `text-charcoal/70` muted but readable
- No gold/cream on cream — fixes the unreadable yellow-on-light issue

### 4. CTA button polish

Audit and apply consistent variants from the existing button system:
- "View menu" → `default` (Red bg, cream text)
- "Get directions" → `outline` (charcoal text, subtle border)
- "Book a table" → `gold` (charcoal text on gold — high contrast)
- Optional admin CTA → `secondary`
- Mobile: stack with `w-full sm:w-auto`, consistent gap, proper focus rings

Removes the previous `onDark` variants no longer needed (hero is light now).

### 5. Admin — Locations Manager

Extend `src/routes/admin.locations.tsx`:
- Add a new tab **"Hero"** (or extend Media tab) with:
  - Hero image upload (existing — confirm `FileUpload` to `locations` bucket with preview + remove)
  - Hero eyebrow (text)
  - Hero title override (text, with helper "Leave blank to use location name")
  - Hero subtitle override (text, helper "Leave blank to use address")
  - Hero CTA label + Hero CTA href (paired)
- All fields wire into the existing form save flow

### 6. Fallback handling

- No hero image → uses bundled `location-wandsworth.jpg` placeholder (already imported)
- No `hero_title` → uses `name`
- No `hero_subtitle` → uses `address, postcode` line
- No `hero_eyebrow` → uses `area` → "London"

### 7. SEO consistency

- `<title>` uses clean `{name} — Southern Italian pizza in {area}` (no double "Reginè")
- JSON-LD `Restaurant.name` uses `name` directly
- og:image uses the per-location `hero_image_url` (already wired)

### Files touched

**New migration**: 5 new columns on `locations`

**Modified**:
- `src/routes/locations.$slug.tsx` — new hero layout, fix title duplication, dynamic fields
- `src/routes/admin.locations.tsx` — new hero fields in form
- `src/integrations/supabase/types.ts` — auto-regenerated

### Deliverables
1. Hero redesign summary (contrast, layout, responsive)
2. Admin fields added (5 new editable fields per location)
3. Schema migration (5 new columns)
4. Confirmation: each location hero fully admin-managed with sensible fallbacks
5. Confirmation: "Reginè Reginè Wandsworth" duplication bug fixed

