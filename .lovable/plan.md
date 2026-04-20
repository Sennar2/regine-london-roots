

## Fix Reginè Pizzeria Build and Deployment

### Problem

The `vite.config.ts` was accidentally replaced with a minimal React-only config, breaking the entire build. This project is a TanStack Start SSR app that requires the `@lovable.dev/vite-tanstack-config` plugin to build and run.

### What needs to happen

**1. Restore `vite.config.ts`**

Replace the current broken config:
```ts
import { defineConfig } from "@lovable.dev/vite-tanstack-config";
export default defineConfig();
```

This single line restores: TanStack Start plugin, Tailwind CSS v4, path aliases (`@/*`), Cloudflare Workers adapter, React plugin, and all SSR plumbing.

**2. No `vercel.json` needed**

This app deploys via Lovable's Publish button (top-right of editor). It runs on Cloudflare Workers with full SSR. A `vercel.json` would have no effect.

**3. Verify build works**

After restoring the config, confirm `npm run build` succeeds.

### Why not Vercel?

- TanStack Start SSR requires a server runtime (Cloudflare Workers, Node.js serverless). A static `dist/` folder with `index.html` rewrites won't work — there is no `index.html` in the output.
- The backend (Lovable Cloud / Supabase) is already integrated. Splitting frontend hosting adds latency and complexity for no benefit.
- Lovable hosting includes SPA fallback, custom domains, and HTTPS out of the box.

### Deployment instructions

1. Click **Publish** in the top-right of the Lovable editor
2. The app deploys to `regine-london-roots.lovable.app`
3. Connect a custom domain (e.g. `reginepizzeria.co.uk`) via Project Settings → Domains

### Files changed

- `vite.config.ts` — restored to `@lovable.dev/vite-tanstack-config`

One file. That's it.

