---
"web": minor
"services": minor
"demo-data": minor
---

Add a static demo mode and GitHub Pages deployment. `services` gains `configureDemoMode`, which switches the query hooks to pre-built static JSON files, swaps the redis-backed read-flag hooks for per-session browser storage, and maps image URLs to static cover files. `web` bootstraps demo mode via `VITE_DEMO_MODE`, supports sub-path hosting via `VITE_BASE_PATH` (router basename included), and adds a `dev:demo` script. The new `demo-data` app generates a deterministic 1500+ note demo vault (journal with habit data, photos, books, movies, quotes, ideas, projects, recipes, people, plus SVG covers) and snapshots the real `notes-api`/`habit-tracker` responses into `apps/web/public/demo-data`; `.github/workflows/deploy-pages.yml` regenerates and deploys the demo to GitHub Pages daily and on pushes to `main`.
