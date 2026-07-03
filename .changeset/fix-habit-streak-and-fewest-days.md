---
"habit-tracker": patch
---

Fix two habit-tracking calculations: a "do-more" streak now requires at least 2 consecutive logged days before it's reported (a single logged day no longer shows as a streak of 1), and "fewest days tracked per period" now discards the oldest tracking period when it started partway through a window instead of counting it as-is, so an incomplete leading window no longer produces an artificially low score.
