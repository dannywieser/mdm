---
"web": patch
---

Add Docker Compose healthchecks for `notes-api`, `flag-manager`, `habit-tracker`, and `image-server` based on their `/health` endpoints, and have `web` wait for all of them to be healthy before starting.
