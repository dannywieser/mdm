---
"notes-api": minor
"markdown": minor
---

Renamed the `titleOrBodyDates` note property to `dates`, and expanded it to include every date found in a note's title, body, and frontmatter, plus the file's modified date. `createdDate` is now derived as the oldest date in this list instead of preferring a configured frontmatter property.
