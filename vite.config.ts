import { defineConfig } from "vite";
import { tanstackStart } from "@tanstack/react-start/plugin/vite";
import { nitro } from "nitro/vite";
import viteReact from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

export default defineConfig({
  resolve: {
    tsconfigPaths: true,
  },
  server: {
    // Keep dev on 5173 (nitro defaults to 3000); the desktop launcher expects this.
    port: 5173,
  },
  plugins: [
    // src/server.ts redirects the bundled SSR entry to our error-wrapping server entry.
    tanstackStart({
      server: { entry: "server" },
    }),
    nitro(),
    viteReact(),
    tailwindcss(),
  ],
});
