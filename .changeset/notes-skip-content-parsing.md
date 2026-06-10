---
"notes-api": patch
"web": patch
---

Add an `includeContent=false` query param to `GET /notes` that skips remark parsing of note bodies, and use it for the gallery views which only need frontmatter.
