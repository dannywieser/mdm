---
"habit-tracker": patch
---

Add a score breakdown to the `GET /habit/:id` response — `rawScore` (entry values with no recency multiplier), `recentEntryAdditions` (the extra amount contributed by entries within the last 14 days), `scoreBeforeMultipliers` (`rawScore + recentEntryAdditions`), `streakMultiplier` (positive for `do-more` habits, negative for `do-less` habits), and `dayMultiplier` (always positive, reflecting how many days in the window have a logged entry) are now included on both the current score and every `history` entry. Each `history` entry also now includes `value`, the frontmatter value logged on that day.
