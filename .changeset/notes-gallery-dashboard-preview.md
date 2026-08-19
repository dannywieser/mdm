---
"web": minor
"notes-api": minor
"app-config": minor
"services": minor
"demo-data": patch
---

Views using the `NotesGallery` component can now set `"dashboardPreview": true` in `app.config.json` to render on the home dashboard as a full-width preview card — the view name and count above a masonry grid of up to 10 thumbnail covers from the view's most recent notes with images — instead of the compact name/count stat card.
