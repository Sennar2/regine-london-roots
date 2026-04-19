

## Reginè Pizzeria — v1 Launch Polish

Refining the existing site into a launch-ready, premium hospitality experience. Keeping current structure, brand, admin, and data — extending where needed.

### 1. Database — add ordering/delivery fields to `locations`

Migration adds four optional URL columns:
- `deliveroo_url`, `justeat_url`, `ubereats_url`, `click_collect_url`
- Plus `is_featured boolean default false` and `full_description text` (separate from short `description`)

No data loss. Existing rows untouched.

### 2. Button system — fix contrast (gold-on-gold issue)

Refactor `src/components/ui/button.tsx` variants:
- `default` (Primary) — Reginè Red bg, cream text
- `secondary` — cream bg, charcoal text, subtle border
- `outline` — transparent bg, charcoal text, charcoal border, hover cream tint
- New `gold` variant — gold bg, **charcoal text** (never gold-on-gold)
- New `onDark` outline — for use on dark hero overlays (cream border + cream text)
- Sizes get a true `xl` for hero CTAs; consistent radius & focus ring across all

Audit all routes — replace ad-hoc `bg-brand-gold` etc. with proper variants. Fix the homepage menu CTA strip and contact-CTA buttons.

### 3. Hero polish (homepage)

- Tighter editorial layout — kicker line, bigger serif headline, refined CTA group
- Better gradient (less heavy at bottom), proper image positioning
- Two CTAs: primary "View Menus" + outline-on-dark "Find Us"
- Improved spacing on mobile (no awkward empty bottom area)
- Add subtle gold separator/serif italic accent line

### 4. First-load intro animation

New component `src/components/site/IntroOverlay.tsx`:
- Cream full-screen overlay, Reginè logo fades + scales in, subtitle "Southern Italian warmth, served in London." fades up
- Auto-dismiss after ~1.6s with smooth fade-out, skippable on click/scroll/keypress
- Uses `sessionStorage` flag `regine_intro_seen` — shows only on first visit per session
- Mounted in `PublicLayout` (not on `/admin` routes)
- Respects `prefers-reduced-motion` (instant skip)

### 5. Location detail page — order/delivery CTAs

Render new section "Order online" with cards/buttons for any of: Deliveroo, Just Eat, Uber Eats, Click & Collect (only those that have URLs). Stacked elegantly on mobile, branded but tasteful (no colored vendor logos — clean labelled buttons with external-link icon).

Also: improved hero CTA group, better hours card styling, embedded map (if `maps_link`).

### 6. Admin — Locations Manager improvements

- Add fields for the 4 ordering URLs + `full_description` + `is_featured`
- Restructure modal into tabbed sections (Basics / Contact & Hours / Media / Ordering & Links / Visibility) for clarity
- Helpful empty states, URL validation hints
- Replace raw JSON textarea for opening hours with a friendly day-by-day editor (Mon–Sun rows)

### 7. Hide admin from public

- Remove the "Admin" link from `Footer.tsx`
- Add `<meta name="robots" content="noindex">` to all `/admin/*` routes (already partial — verify)
- Admin only reachable by typing `/admin` directly

### 8. Footer refinement

- Add Instagram + Facebook icons (from `site_settings.social_links`)
- Cleaner 4-column layout with logo + tagline, Visit, Explore, Follow
- No admin link
- Subtle terracotta divider accent

### 9. Header polish

- CTA button uses new gold variant safely (charcoal text)
- Slightly larger logo, refined nav spacing
- Mobile drawer animation (slide + fade)

### 10. SEO additions

- `public/robots.txt` — allow all, disallow `/admin`, point to sitemap
- Server route `/sitemap.xml` — dynamically lists `/`, `/about`, `/locations`, `/menus`, `/gallery`, `/contact`, plus each active location slug
- JSON-LD `Restaurant` schema on each location detail page (name, address, phone, hours, image)
- Per-route head metadata audit — confirm unique title/description/og on every public page

### 11. Polish pass

- Consistent section padding rhythm
- Lazy-load all gallery images
- Focus rings visible on all interactive elements
- Form a11y check on contact page
- Small terracotta SVG motif decorations behind section headings (low opacity)

### Files touched (summary)

**New:** `src/components/site/IntroOverlay.tsx`, `src/components/admin/HoursEditor.tsx`, `src/routes/sitemap[.]xml.tsx`, `public/robots.txt`, migration SQL

**Modified:** `button.tsx`, `Header.tsx`, `Footer.tsx`, `PublicLayout.tsx`, `index.tsx` (home), `locations.$slug.tsx`, `admin.locations.tsx`, `lib/site.ts` (add social helper)

### Deliverables at the end
1. UI/UX changes summary
2. Admin changes summary
3. SQL migration (new location fields)
4. Intro animation behavior notes
5. Confirmation admin link removed from footer
6. Setup notes (none new — all auto-configured)

