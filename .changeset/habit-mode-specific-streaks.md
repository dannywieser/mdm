---
"habit-tracker": patch
---

Add a dedicated `streaks` block to the `GET /habit/:id` response describing historical streak periods (`start`/`end`/`length`): for `do-more` habits these are periods of consecutive logged days, and for `do-less` habits these are gaps of consecutive unlogged days that fall strictly between two logged entries. The top-level `streak` field continues to reflect the current streak (consecutive logged days for `do-more`, days since the last entry for `do-less`), and `allTimeHighStreak` is now derived from the longest entry in `streaks`.
