# OffTheGrid

A visual time-block timer app built with [TanStack Start](https://tanstack.com/start) (React, Vite, Tailwind CSS v4, shadcn/radix UI). Create sets of time-blocks — like a morning routine — and run each timer one tap at a time.

## Getting started

```bash
pnpm install
pnpm dev
```

## Scripts

| Command           | Description                                   |
| ----------------- | --------------------------------------------- |
| `pnpm dev`        | Start the dev server                          |
| `pnpm build`      | Production build (SSR bundle + client bundle) |
| `pnpm preview`    | Preview the production build                  |
| `pnpm lint`       | ESLint                                        |
| `pnpm format`     | Prettier                                      |
| `pnpm test`       | Run vitest once                               |
| `pnpm test:watch` | Run vitest in watch mode                      |

## Deploying to Netlify

The project deploys to Netlify with full SSR via the official [`@netlify/vite-plugin-tanstack-start`](https://docs.netlify.com/build/frameworks/framework-setup-guides/tanstack-start/) plugin. Build settings live in [`netlify.toml`](netlify.toml):

- **Build command:** `vite build`
- **Publish directory:** `dist/client`

Connect the repo in the Netlify dashboard (or run `netlify deploy`) and it will pick up the settings automatically. Netlify CLI must be **17.31+** when using the plugin.
