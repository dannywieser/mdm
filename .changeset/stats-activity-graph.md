---
"web": minor
"services": minor
"demo-data": patch
---

Add a GitHub-style activity graph to the `/stats` page — one square per day, shaded by how many notes were created and modified that day, sourced from the new `GET /stats/history` endpoint. Adds a `useStatsHistory` hook and `StatsHistoryResponse`/`StatsHistoryEntry` types to `services`.
