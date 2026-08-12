---
"habit-tracker": patch
"notes-api": patch
"stats-service": patch
---

Fixed three services that assumed a filesystem vault is always present, which broke them under `notesSource: "bear"` (added in a previous release): `GET /health` on `notes-api`, `habit-tracker`, and `stats-service` always returned `503` in Bear mode since it tried to check the (intentionally empty) vault path; `habit-tracker`'s `GET /habits`/`GET /habits/:id` and `stats-service`'s `GET /stats/meta`/`GET /stats/history` always returned `500` (`ENOENT`) since they scanned the same empty path directly.

`/health` now only checks vault readability when `notesSource` is `"obsidian"`. `habit-tracker` and `stats-service` now skip the filesystem scan in `"bear"` mode and return zeroed-out results (empty habit scores, empty stats/history) instead of erroring — full support for scoring habits/stats from Bear-sourced notes is tracked separately.
