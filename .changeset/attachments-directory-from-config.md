---
"notes-api": patch
"app-config": patch
---

Read `attachmentsDirectory` from `app.config.json` (relative to notes root) instead of the `IMAGES_ROOT` env var. Bare-filename images (no path separator) in note bodies and frontmatter now resolve to `<attachmentsDirectory>/<noteDir>/<noteStem>/<filename>` when `attachmentsDirectory` is configured.
