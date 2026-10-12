import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { previewCompression } from "./scripts/preview-compression";
export default defineConfig(({ mode }) => ({
  base: mode === "github" ? "/portfolio/" : "/",
  plugins: [react(), previewCompression()],
  server: {
    host: "127.0.0.1",
    port: 5173,
    strictPort: true,
    allowedHosts: ["jellyfin-server.tail253f4c.ts.net"],
  },
  preview: {
    host: "127.0.0.1",
    port: 4173,
    strictPort: true,
    allowedHosts: ["jellyfin-server.tail253f4c.ts.net"],
  },
}));
