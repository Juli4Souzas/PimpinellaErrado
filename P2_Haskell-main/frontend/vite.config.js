import { defineConfig } from "vite";

// /api vai para a API Haskell (assim funciona no Codespace sem CORS)
export default defineConfig({
  server: {
    port: 5173,
    allowedHosts: true,
    proxy: { "/api": process.env.API_URL || "http://localhost:8080" }
  }
});
