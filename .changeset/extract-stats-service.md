---
"notes-api": major
"stats-service": major
"mdm-util": minor
---

Extract vault statistics into a new dedicated `stats-service` app. `GET /stats` has been removed from `notes-api` (a breaking change); the new `stats-service` exposes `GET /stats/meta`, returning total notes, total folders, total words (counted from note bodies, excluding frontmatter), and total attachments grouped by file extension. `mdm-util` gains `countWords` and `countFilesByExtension` (replacing `countFilesRecursive`) to support the new endpoint.
