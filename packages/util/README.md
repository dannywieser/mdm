# util (`mdm-util`)

Shared, dependency-free pure functions used across the mdm codebase: date arithmetic, string/object helpers, regex pattern building, deterministic IDs, and small async/promise utilities. Anything domain-specific (notes, markdown, habits) does not belong here — see `packages/markdown` and `packages/app-config` instead.

## Usage

```ts
import { addDays, buildDateRange, daysBetween, getDateWindowStart, formatDate, getDateComponents, toISODateString, parseDateFromFormats, isValidTimezone, isNonEmptyString, mapWithConcurrency, toLoggableError } from "mdm-util"
```

Two additional subpath exports isolate dependencies that don't belong in every consumer's bundle:

- `mdm-util/node` — Node-only helpers (`countFilesByExtension`, `assertDirectoryReadable`, `startServer`), kept out of the default entry point so it's safe to import `mdm-util` from browser code (`apps/web`). `startServer` wraps `app.listen(...)` with SIGTERM/SIGINT graceful shutdown (drain in-flight requests, run an optional cleanup callback, force-exit after a timeout) shared by all 5 backend services.
- `mdm-util/redis` — `createRedisClient`, a thin wrapper around the `redis` client exposing the `connect`/`disconnect`/`get`/`set`/`on`/`ping` surface shared by `apps/flag-manager` and `apps/image-server`'s caches. `ping` is used by `flag-manager`'s `/health` endpoint to verify Redis is actually reachable; `disconnect` is called during graceful shutdown.

## Structure

- `date/` — `addDays`, `daysBetween`, `daysToSeconds`, `buildDateRange`, `getDateWindowStart`, `formatDate`, `getDateComponents`, `toISODateString`, `isValidTimezone`, `parseDateFromFormats`. Before writing new date logic anywhere in the repo, check here first (see the root `CLAUDE.md` util package guidelines).
- `strings/` — `countWords`, `isNonEmptyString`, `isStringArray`, `isStringRecord`.
- `objects/` — `getObjectValue`, `getValueByPath` (dot-path property access used by the notes view filters).
- `promises/` — `mapWithConcurrency`, a bounded-concurrency async map that preserves input order regardless of completion order.
- `regex/` — `buildCapturingPattern`, builds a full-string regex + token list from a tokenized format string (backs date format parsing).
- `ids/` — `createFileID`, a deterministic UUIDv5 for a file path within a namespace.
- `file-system/` — `normalizeFilePathForId` (used by `createFileID`), `countFilesByExtension`, and `assertDirectoryReadable` (the latter two exposed via the `./node` subpath).
- `logging/` — `toLoggableError`, normalizes thrown values into a loggable shape for pino-backed loggers.
- `redis/` — `createRedisClient` (exposed via the `./redis` subpath).
- `server/` — `startServer` (exposed via the `./node` subpath).
