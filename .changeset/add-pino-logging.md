---
"notes-api": minor
"habit-tracker": minor
"flag-manager": minor
"image-server": minor
---

Replace morgan and console logging with Pino structured JSON logging across all backend services. Log level is controlled via the `LOG_LEVEL` environment variable (default: `info`).
