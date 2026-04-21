

## Fix Reginè Pizzeria — Favicon and Deployment

### Current state

The project is correctly configured as a **TanStack Start SSR application** targeting Cloudflare Workers. The `vite.config.ts` is correct. The build works. The `public/favicon.ico` file exists.

### What is actually broken

1. **Missing favicon link tag**: The root route's `head()` does not include a `<link rel="icon">` tag, so browsers request `/favicon.ico` but the HTML never declares it. Some browsers still find it by convention, but explicit declaration is best practice.

2. **Vercel is the wrong deployment target**: This is an SSR application (server-rendered on every request via Cloudflare Workers). It does not produce a static `dist/index.html`. Vercel cannot serve it without a custom server adapter, and TanStack Start v1 does not ship one. The correct deployment is via the **Publish** button in the Lovable editor, which deploys to Cloudflare Workers with full SSR. All routes (`/`, `/about`, `/locations/[slug]`, `/admin`, etc.) work correctly when published this way.

### Changes

**1. Add favicon link to `src/routes/__root.tsx`**

Add to the `links` array in `head()`:

```ts
{ rel: "icon", href: "/favicon.ico", type: "image/x-icon" },
```

This ensures all pages declare the favicon and browsers resolve `/favicon.ico` correctly.

**No other files need changing.** The `vite.config.ts`, `package.json`, `wrangler.jsonc`, route files, and `public/favicon.ico` are all correct.

### Deployment

- **Do not use Vercel.** This SSR app requires a server runtime.
- Click **Publish** (top-right of editor) to deploy to Cloudflare Workers.
- Production URL: `regine-london-roots.lovable.app`
- Custom domain: Project Settings, then Domains

### Deliverables

1. **What was broken**: Missing favicon `<link>` tag in root head; Vercel is not compatible with this SSR architecture
2. **Files changed**: `src/routes/__root.tsx` (add favicon link)
3. **Deployment settings**: Use Lovable Publish (not Vercel)
4. **Confirmation**: `/` works via Lovable hosting with full SSR
5. **Confirmation**: `/favicon.ico` served from `public/` and declared in HTML head

