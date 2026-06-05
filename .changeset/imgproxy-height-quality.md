---
"image-server": patch
---

Add a max-height constraint to the imgproxy URL builder (default 768px) alongside the existing width cap (default 1024px). Both limits are overridable via `IMAGE_MAX_WIDTH` and `IMAGE_MAX_HEIGHT` environment variables. The Redis cache key now incorporates both dimensions so height changes invalidate stale entries.
