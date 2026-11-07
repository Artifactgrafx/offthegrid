# Project notes

OffTheGrid — a TanStack Start (React) time-block timer app.

- Stack: TanStack Start 1.16x (Vite plugin architecture) + TanStack Router + TanStack Query, Tailwind CSS v4, shadcn/radix UI components in `src/components/ui/`.
- Deploys to Netlify with SSR via `@netlify/vite-plugin-tanstack-start` (see `netlify.toml`). Locate build settings there — do not regenerate them.
- `src/server.ts` is a custom SSR entry that wraps TanStack Start's server entry for better 500-page/error capture. It is wired through `tanstackStart({ server: { entry: "server" } })` in `vite.config.ts` — keep that option if you move files.
- `src/start.ts` defines global server middleware (error wrapper + CSRF for server functions).
- Tests use vitest + jsdom + Testing Library (`src/test/`).
- Package manager: pnpm.
