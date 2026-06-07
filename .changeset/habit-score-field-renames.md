---
"habit-tracker": patch
---

Rename `score` to `habitScore` and `totalScore` to `scoreBeforeMultipliers` in the `GET /habit/:id` response — both at the top level and in each `history` entry — to better reflect what each value represents.
