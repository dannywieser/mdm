---
"habit-tracker": minor
"app-config": minor
---

Add an optional `targetScore` to habit configuration (used by `do-less` habits to define green/yellow/red score thresholds for the UI), include `mode` and `targetScore` in the `GET /habit/:id` response, and add a new `GET /habits` endpoint that lists every configured habit with its current score, streak, mode, and `targetScore`.
