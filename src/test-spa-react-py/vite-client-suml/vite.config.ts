import path from "path"
import react from "@vitejs/plugin-react"
import { defineConfig } from "vite"
import { TanStackRouterVite } from '@tanstack/router-plugin/vite'

export default defineConfig({
  plugins: [react(), TanStackRouterVite()],
  resolve: {
    alias: {
      "@": path.resolve(path.dirname(__dirname), "./src"),
    },
  },
  server: {
    proxy: {
      "/api": "http://localhost:2137",
    },
  },
})
