---
"habit-tracker": patch
---

Make the `GET /habit/:id` streak calculation mode-specific. For `do-more` habits, the streak is still the number of consecutive days (ending on the reference date) with a logged entry. For `do-less` habits, the streak is now the number of days since the most recent entry — reflecting how long it's been since the habit was last logged — rather than consecutive days with entries (an entry on the reference date itself resets the streak to `0`).
