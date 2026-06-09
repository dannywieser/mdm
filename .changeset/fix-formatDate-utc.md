---
"mdm-util": patch
"notes-api": patch
"web": patch
---

`formatDate` now accepts a required `timeZone` parameter so callers are always explicit about timezone. A new `formatDateLabel` utility formats date strings as short month+day labels (e.g. "Jun 1"). The stats API now includes `timezone` in its response so the web app uses the configured timezone consistently throughout.
