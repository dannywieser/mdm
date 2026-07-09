---
"web": patch
"notes-api": patch
"flag-manager": patch
"habit-tracker": patch
"stats-service": patch
"image-server": patch
---

Removes the opt-in `watchtower` service and its labels from `docker-compose.yml`. Image updates are now manual only: run `docker compose pull && docker compose up -d` (or `npm run docker:update`).
