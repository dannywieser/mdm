import path from "node:path"
import react from "@vitejs/plugin-react"
import { defineConfig } from "vite"

// https://vite.dev/config/
export default defineConfig({
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
      "/imgproxy": {
        target: "http://localhost:8080",
        rewrite: (path) => path.replace(/^\/imgproxy/, ""),
      },
    },
  },
})
