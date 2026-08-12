---
"bear-sync": minor
"markdown": minor
"notes-api": minor
"notes-ingest": minor
"web": minor
---

Notes now carry a first-class `tags` field, populated by scanning the note body for inline hashtags (`#foo/bar`, and Bear's closing-hash `#multi word tag#` form) — the same syntax Bear treats as first-class, previously only available in Obsidian via frontmatter. Both note sources (file scan and Bear sync) extract tags this way, so `tags` is available on every note regardless of `notesSource`.

`tags` is a plain string array, so it works with view filters exactly like any other array-valued property (for example `{"tags": "personal/daily"}` in a view's `filters`) and with `badges`/`notesGalleryFilters` the same as `frontmatter.*` array fields. In rendered note content, each inline hashtag is now replaced with a `{"type": "tag", "value": "..."}` markdown node instead of being left as plain text, and `apps/web` renders it as a small badge inline with the surrounding text.

`notes-ingest`'s `POST /notes/sync` payload validation now requires `tags` (a string array) on every synced note.
