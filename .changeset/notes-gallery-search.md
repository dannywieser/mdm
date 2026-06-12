---
"web": minor
"notes-api": patch
"markdown": patch
---

Add a search input to the header on the notes gallery view that filters note cards by matching keywords against the title, frontmatter, and full note body text. The `/notes` API response now includes a `fullText` field on each note containing its raw markdown body.
