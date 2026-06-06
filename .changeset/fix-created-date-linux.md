---
"notes-api": patch
---

Fix notes-per-day chart showing incorrect creation dates on Linux: prefer `frontmatter.created` over `stat.birthtime`, which is unreliable when files are copied or volume-mounted into Docker containers.
