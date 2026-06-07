---
"habit-tracker": patch
---

Fix the sign of the `streakMultiplier` and `dayMultiplier` score contributions for `do-less` habits in the `GET /habit/:id` response. `dayMultiplier` is now always positive in both modes (more days with entries always raises the score before the streak adjustment), while `streakMultiplier` is positive for `do-more` habits and negative for `do-less` habits (a long gap since the last entry now lowers the score, as intended).
