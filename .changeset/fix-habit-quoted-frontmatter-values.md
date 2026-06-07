---
"habit-tracker": patch
---

Fix `GET /habit/:id` failing to count entries whose frontmatter property value is wrapped in quotes (for example `drinking: "3"`). The quoted string was passed directly to `parseFloat`, which returned `NaN` and caused the entry to be silently dropped.
