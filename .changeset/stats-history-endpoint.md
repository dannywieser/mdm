---
"stats-service": minor
"mdm-util": minor
---

Add `GET /stats/history` to stats-service, returning a per-date breakdown of notes created, notes modified, and distinct folders touched across the vault. Adds a `toISODateString` timezone-aware date formatter to `mdm-util`.
