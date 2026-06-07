---
"habit-tracker": patch
---

Make the `GET /habit/:id` streak calculation mode- and context-specific. For `do-more` habits, the streak is still the number of consecutive days (ending on the reference date) with a logged entry, in both the current score and history. For `do-less` habits, the streak now reflects how long the habit went unlogged: the *current* streak is the number of days since the most recent entry (an entry logged today resets it to `0`), while each *history* entry's streak is the number of days between that entry and the previous one — rather than consecutive days with entries.
