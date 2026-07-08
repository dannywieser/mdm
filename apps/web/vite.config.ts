import path from "node:path"
import react from "@vitejs/plugin-react"
import { defineConfig } from "vite"

// https://vite.dev/config/
export default defineConfig({
  // Deployments under a sub-path (e.g. GitHub Pages) set VITE_BASE_PATH.
  base: process.env.VITE_BASE_PATH ?? "/",
  resolve: {
    alias: {
      "mdm-util": path.resolve(__dirname, "../../packages/util/src/index.ts"),
      services: path.resolve(__dirname, "../../packages/services/src/index.ts"),
    },
  },
  plugins: [react()],
  server: {
    proxy: {
      "/api": {
        target: "http://localhost:3000",
        rewrite: (path) => path.replace(/^\/api/, ""),
      },
      "/flags": {
        target: "http://localhost:3001",
      },
      "/habit": {
        target: "http://localhost:3003",
      },
      "/images": {
        target: "http://localhost:3002",
      },
      "/stats/": {
        target: "http://localhost:3004",
      },
      "/imgproxy": {
        target: "http://localhost:8080",
        rewrite: (path) => path.replace(/^\/imgproxy/, ""),
      },
    },
  },
})
