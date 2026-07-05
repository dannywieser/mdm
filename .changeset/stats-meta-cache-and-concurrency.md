---
"stats-service": minor
"mdm-util": minor
---

Fix `GET /stats/meta` spiking memory and file-descriptor usage on large vaults (observed causing container restarts with ~4600 notes / 3000 attachments): note bodies are now read with a bounded concurrency (20 at a time via the new `mapWithConcurrency` utility in `mdm-util`) instead of all at once. The response is also cached in memory for 5 minutes, with concurrent requests during a cache miss sharing a single in-flight scan rather than each triggering their own.
