---
"web": patch
---

Fix the web image serving stale content after a deploy: nginx now sends `no-cache` for `index.html`/SPA routes so browsers always revalidate them, and long-lived immutable caching for Vite's content-hashed `/assets/` files, so updates take effect without a manual browser cache clear.
