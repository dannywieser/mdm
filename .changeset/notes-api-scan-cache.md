---
"notes-api": patch
---

`GET /notes` previously rescanned and re-read every file in the vault from disk on every request, regardless of `view`/`includeContent`. The vault scan is now cached in memory for 5 minutes (mirroring `stats-service`'s existing cache), shared across all requests and query param combinations, with concurrent cache misses sharing a single in-flight scan. View filtering and markdown body parsing still run per request against the cached scan, since both depend on query params.
