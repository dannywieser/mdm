# logger (`mdm-logger`)

Thin wrapper around [pino](https://getpino.io) that gives every backend service the same structured logger setup. Used by `notes-api`, `flag-manager`, `habit-tracker`, `image-server`, and `stats-service`, each wiring it into `pino-http` request logging in their `server.ts`.

## Usage

```ts
import { createLogger } from "mdm-logger"

export const logger = createLogger("notes-api")
```

- `createLogger(service)` returns a pino instance tagged with `name: service`, so log lines from different services are distinguishable in aggregated output.
- Log level is controlled by the `LOG_LEVEL` environment variable (defaults to `"info"`) — shared across all services, no per-service configuration needed.

## Structure

- `createLogger.ts` — the `createLogger` factory.
- `index.ts` — re-exports `createLogger`.
