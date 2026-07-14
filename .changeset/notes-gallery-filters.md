---
"web": major
"notes-api": minor
"app-config": minor
"services": minor
---

Add a filter panel to the notes gallery view with quick filters for year and frontmatter values, move note search into the panel with a new clear button, and show active filters as removable chips above the gallery. Which frontmatter properties are offered as gallery filters is now controlled per-view via a new `frontmatterFilters` array in `app.config.json`'s `views` config (exposed through `GET /views`); a view with no `frontmatterFilters` configured only shows search and the year filter.
