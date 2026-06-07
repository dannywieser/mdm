---
"habit-tracker": patch
---

Rename `score` to `habitScore`, `totalScore` to `scoreBeforeMultipliers`, and `totalEntries` to `windowEntries` in the `GET /habit/:id` response — both at the top level and (where applicable) in each `history` entry — to better reflect what each value represents.
