---
"habit-tracker": patch
---

Change how `dayMultiplier` and `streakMultiplier` combine in the `GET /habit/:id` score formula: `habitScore` is now `floor(scoreBeforeMultipliers * (1 + dayMultiplier) * (1 + streakMultiplier))` (multiplicative) rather than `floor(scoreBeforeMultipliers * (1 + dayMultiplier + streakMultiplier))` (additive), so the result matches the original ad-hoc scoring logic. The two approaches agree in most cases but can differ by 1 near floor boundaries due to the cross term between the two adjustments.
