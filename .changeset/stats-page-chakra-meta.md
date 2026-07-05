---
"services": major
"web": minor
---

Update the stats page to use the new `stats-service` meta endpoint. `useStatsQuery` now fetches `GET /stats/meta` (configurable via `setStatsBaseUrl`/`VITE_STATS_BASE_URL`, defaulting to `/stats`) and exposes `StatsMetaResponse` (`totalNotes`, `totalFolders`, `totalWords`, `totalAttachments`) in place of the old, richer `StatsResponse` shape (a breaking change to `services`). The `/stats` page is simplified to display only this data — total notes, folders, and words, plus an attachment breakdown by file extension — using Chakra UI's Stat component. The notes-created trend chart and folder breakdown, which relied on data no longer returned by the backend, have been removed.
