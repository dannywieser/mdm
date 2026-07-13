---
"app-config": minor
"markdown": minor
"notes-api": minor
"services": minor
"web": minor
---

Add a configurable `coverProperty` config option (defaults to `"cover"`) for the frontmatter key used as a note's cover image. When a note has no value under that key, `GET /notes` and `GET /views` now fall back to the first image found in the note's raw body text (standard markdown or an Obsidian `![[...]]` embed) instead of requiring an explicit cover to be set. The web app's gallery views now read the configured property name instead of a hardcoded `"cover"` key.
