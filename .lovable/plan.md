

## Fix Reginè Pizzeria — Restore Working Build

### What's broken

The `vite.config.ts` was expanded into explicit plugin imports, but `nitro` is not an installed dependency. The build fails immediately with `Cannot find package 'nitro'`. The previous working config used `@lovable.dev/vite-tanstack-config` (which is installed in devDependencies) — that single wrapper handles all plugins internally.

### The Vercel question

This project is a **TanStack Start SSR application** targeting Cloudflare Workers. It is not a static SPA. There is no `index.html` in the build output — the server renders pages on request. Vercel cannot deploy this without a custom adapter, and TanStack Start does not ship a Vercel adapter in v1.

**The correct deployment path is Lovable's Publish button** (top-right of the editor), which deploys to Cloudflare Workers with full SSR. This is already configured via `wrangler.jsonc`. A custom domain can be connected in Project Settings → Domains.

### Fix (1 file)

**Restore `vite.config.ts`** to:
```ts
import { defineConfig } from "@lovable.dev/vite-tanstack-config";
export default defineConfig();
```

This single line restores: TanStack Start plugin, Tailwind CSS v4, path aliases, React plugin, and the Cloudflare Workers SSR adapter. No other files need changing.

### Deployment settings

- **Do not use Vercel.** This app requires a server runtime for SSR.
- Click **Publish** in the Lovable editor to deploy.
- Production URL: `regine-london-roots.lovable.app`
- To use a custom domain (e.g. `reginepizzeria.co.uk`): Project Settings → Domains

### What stays the same

All pages, admin dashboard, branding, database logic, routes, and content remain untouched. This is a single config file restore.

### Deliverables
1. **What was broken**: `vite.config.ts` referenced uninstalled `nitro/vite` package
2. **File changed**: `vite.config.ts` (restored to `@lovable.dev/vite-tanstack-config`)
3. **Deployment**: Use Lovable Publish (Cloudflare Workers SSR), not Vercel
4. **Confirmation**: Build will succeed and all routes (`/`, `/about`, `/locations`, `/menus`, `/gallery`, `/contact`, `/admin`) will work with SSR

