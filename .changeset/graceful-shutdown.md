---
"notes-api": patch
"habit-tracker": patch
"stats-service": patch
"flag-manager": patch
"image-server": patch
"mdm-util": patch
---

All 5 backend services now handle SIGTERM/SIGINT gracefully: they stop accepting new connections, let in-flight requests finish, disconnect Redis where applicable (`flag-manager`, `image-server`), and force-exit after a 10s timeout if something hangs, instead of being hard-killed mid-request. This is implemented via a new shared `startServer` helper in `mdm-util/node` that also consolidates the near-identical `app.listen(...)` + logging boilerplate that was previously duplicated across all 5 `server.ts` files. `mdm-util`'s Redis client wrapper (`mdm-util/redis`) gains a `disconnect` method used during shutdown.
