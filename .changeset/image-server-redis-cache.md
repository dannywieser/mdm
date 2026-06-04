---
"image-server": minor
---

Cache imgproxy redirect URLs in Redis to avoid recomputing them on every request. TTL defaults to 86400 seconds (24h) and is configurable via the `IMAGE_CACHE_TTL_SECONDS` environment variable.
