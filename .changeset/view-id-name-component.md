---
"app-config": minor
"notes-api": minor
"web": minor
---

Views in `app.config.json` now require three distinct fields:

- `id` — the route key used in `GET /notes?view=<id>` and `/notes/:view` routing
- `name` — human-readable label displayed in the UI
- `component` — the web component used to render that view route (for example `NotesList` or `NotesReview`)

The `GET /stats` response includes `id` and `component` alongside `name` and `count` for each view. The web route `/notes/:view` resolves the configured component by `id` and renders it dynamically.
