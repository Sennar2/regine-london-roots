import { Outlet, Link, createRootRoute, HeadContent, Scripts } from "@tanstack/react-router";

import appCss from "../styles.css?url";

function NotFoundComponent() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <h1 className="text-7xl font-bold text-foreground font-serif">404</h1>
        <h2 className="mt-4 text-xl font-semibold text-foreground">Page not found</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          The page you're looking for doesn't exist or has been moved.
        </p>
        <div className="mt-6">
          <Link
            to="/"
            className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
          >
            Go home
          </Link>
        </div>
      </div>
    </div>
  );
}

export const Route = createRootRoute({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1" },
      { title: "Reginè Pizzeria — Southern Italian warmth, served in London" },
      { name: "description", content: "Reginè Pizzeria — a Southern Italian family pizzeria in London. Authentic wood-fired pizza, simple ingredients and proper hospitality." },
      { name: "theme-color", content: "#B22234" },
      { property: "og:site_name", content: "Reginè Pizzeria" },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
      { property: "og:title", content: "Reginè Pizzeria — Southern Italian warmth, served in London" },
      { name: "twitter:title", content: "Reginè Pizzeria — Southern Italian warmth, served in London" },
      { property: "og:description", content: "Reginè Pizzeria — a Southern Italian family pizzeria in London. Authentic wood-fired pizza, simple ingredients and proper hospitality." },
      { name: "twitter:description", content: "Reginè Pizzeria — a Southern Italian family pizzeria in London. Authentic wood-fired pizza, simple ingredients and proper hospitality." },
      { property: "og:image", content: "https://storage.googleapis.com/gpt-engineer-file-uploads/zLLyx6deLRPOUX76f0u75YwyLiu1/social-images/social-1776506966914-Regine_-_Bussiness_Card_-_Front.webp" },
      { name: "twitter:image", content: "https://storage.googleapis.com/gpt-engineer-file-uploads/zLLyx6deLRPOUX76f0u75YwyLiu1/social-images/social-1776506966914-Regine_-_Bussiness_Card_-_Front.webp" },
    ],
    links: [
      { rel: "icon", href: "/favicon.ico", type: "image/x-icon" },
      { rel: "stylesheet", href: appCss },
      { rel: "preconnect", href: "https://fonts.googleapis.com" },
      { rel: "preconnect", href: "https://fonts.gstatic.com", crossOrigin: "anonymous" },
      { rel: "stylesheet", href: "https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,400;0,500;0,600;1,400;1,500&family=Inter:wght@300;400;500;600&display=swap" },
    ],
  }),
  shellComponent: RootShell,
  component: RootComponent,
  notFoundComponent: NotFoundComponent,
});

function RootShell({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <HeadContent />
      </head>
      <body>
        {children}
        <Scripts />
      </body>
    </html>
  );
}

function RootComponent() {
  return <Outlet />;
}
