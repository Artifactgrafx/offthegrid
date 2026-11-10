import { defineConfig } from "vite";
import { tanstackStart } from "@tanstack/react-start/plugin/vite";
import netlify from "@netlify/vite-plugin-tanstack-start";
import viteReact from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

export default defineConfig({
  resolve: {
    tsconfigPaths: true,
  },
  plugins: [
    // src/server.ts redirects the bundled SSR entry to our error-wrapping server entry.
    tanstackStart({
      server: { entry: "server" },
    }),
    viteReact(),
    tailwindcss(),
    netlify({
      dev: {
        // The middleware's static emulation serves project files raw before
        // Vite's transform pipeline, so Tailwind never compiles in dev.
        // Disable it; Vite dev serves publicDir assets itself.
        staticFiles: { enabled: false },
      },
    }),
  ],
});
