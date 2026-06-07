---
"habit-tracker": patch
---

Add a score breakdown to the `GET /habit/:id` response — `rawScore` (entry values with no recency multiplier), `recentEntryAdditions` (the extra amount contributed by entries within the last 14 days), `totalScore` (`rawScore + recentEntryAdditions`), `streakMultiplier`, and `dayMultiplier` (positive for `do-more` habits, negative for `do-less` habits) are now included on both the current score and every `history` entry. Each `history` entry also now includes `value`, the frontmatter value logged on that day.
