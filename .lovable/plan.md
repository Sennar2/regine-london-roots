

## Make Reginè Pizzeria deploy on Vercel

### What is actually broken

This is a **TanStack Start SSR** app. The current `vite.config.ts` uses `@lovable.dev/vite-tanstack-config`, which **hard-loads `@cloudflare/vite-plugin` during `vite build`**. That produces a Cloudflare Workers bundle (no `dist/index.html`, no Vercel Functions output). Vercel deploys the build, finds nothing it can serve, and returns 404 at `/`.

There is nothing wrong with your routes, favicon, Supabase wiring, or admin dashboard. The only blocker is the build target.

### The fix (Vercel-official path)

Vercel officially supports TanStack Start via the **Nitro Vite plugin** (`nitro/vite`). Nitro auto-detects Vercel during `vercel build` and emits the correct `.vercel/output/` (Vercel Build Output API v3) — Vercel then serves SSR through Vercel Functions and static assets from the CDN. SPA routing, deep links, and refreshes all work out of the box because Nitro generates Vercel route configs for every TanStack route.

### Files changed (4)

**1. `vite.config.ts`** — replace the Lovable Cloudflare wrapper with a direct TanStack + Nitro config:

```ts
import { defineConfig } from "vite";
import { tanstackStart } from "@tanstack/react-start/plugin/vite";
import { nitro } from "nitro/vite";
import viteReact from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import tsConfigPaths from "vite-tsconfig-paths";

export default defineConfig({
  resolve: { alias: { "@": `${process.cwd()}/src` } },
  plugins: [
    tsConfigPaths({ projects: ["./tsconfig.json"] }),
    tailwindcss(),
    tanstackStart(),
    nitro(),
    viteReact(),
  ],
  server: { host: "::", port: 8080 },
});
```

**2. `package.json`** — add `nitro` to dependencies (everything else stays).

**3. `vercel.json`** (new) — pin framework + build so Vercel doesn't try to override:

```json
{
  "buildCommand": "vite build",
  "framework": null
}
```

(No `rewrites` block — Nitro emits its own routing; manual rewrites would break SSR.)

**4. `wrangler.jsonc`** — delete. Cloudflare config is no longer used and could confuse tooling.

### What stays untouched

- All 19 route files (`/`, `/about`, `/locations`, `/locations/$slug`, `/menus`, `/gallery`, `/contact`, `/admin/*`, `/sitemap.xml`)
- `src/routes/__root.tsx` (favicon link already declared, kept as-is — `/favicon.ico` will be served from `public/`)
- Supabase client, admin auth middleware, all components, branding, content
- `src/integrations/supabase/*`, edge logic, RLS

### Exact Vercel project settings

| Setting | Value |
|---|---|
| Framework Preset | **Other** (let `vercel.json` drive it) |
| Build Command | `vite build` (auto from vercel.json) |
| Output Directory | leave **empty** (Nitro writes to `.vercel/output/` automatically) |
| Install Command | `npm install` (default) |
| Node.js Version | 20.x or 22.x |
| Environment Variables | copy `VITE_SUPABASE_URL`, `VITE_SUPABASE_PUBLISHABLE_KEY`, `VITE_SUPABASE_PROJECT_ID` from `.env` into Vercel project env (Production + Preview) |

**Do NOT** set Output Directory to `dist` — that's the wrong target for SSR. Leave it blank.

### Result after deploy

- `GET /` → SSR-rendered homepage (no 404)
- `GET /about`, `/locations`, `/locations/{slug}`, `/menus`, `/gallery`, `/contact`, `/admin` → all SSR, refresh-safe
- `GET /favicon.ico` → served directly from `public/favicon.ico` by Vercel CDN
- `GET /sitemap.xml` → served by the existing server route
- Admin dashboard + Supabase auth continue to work (env vars carry over)

### Deliverables checklist

1. **What was broken**: `vite.config.ts` built for Cloudflare Workers, producing zero Vercel-compatible output → 404 at `/`
2. **Files changed**: `vite.config.ts` (rewritten), `package.json` (add `nitro`), `vercel.json` (new), `wrangler.jsonc` (deleted)
3. **Vercel settings**: Framework = Other, Build = `vite build`, Output = empty, env vars copied from `.env`
4. **Repo ready for Vercel**: yes, after `npm install` runs on Vercel it will pull `nitro` and emit `.vercel/output/`
5. **`/` and `/favicon.ico`**: both will work — `/` via Vercel Functions (SSR), favicon via static asset serving

