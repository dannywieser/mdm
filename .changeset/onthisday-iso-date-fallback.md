---
"notes-api": patch
---

Fix `$onThisDay`/`$today` view filters to also match ISO-formatted dates (e.g. a note's `modifiedDate`/`creationDate`) inside a `dates` array field, not just dates extracted from note text in the configured `dateFormats`. Previously, ISO-formatted entries in a `dates` array were silently ignored by these filters even though the single-value date filter path already handled them — this made "on this day"-style views miss notes that don't have a format-matched date embedded in their title/body, which is common for Bear-sourced notes relying on their DB-tracked creation/modification dates.
