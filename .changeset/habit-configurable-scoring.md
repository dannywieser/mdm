---
"app-config": minor
"habit-tracker": minor
---

Habit scoring is now configurable per-habit via an optional `scoring` object in `app.config.json` (`recentWindowDays`, `recentMultiplier`, `bonusTierSize`, `baseBonusRate`, `bonusRateIncrement`, `minStreakDays`), defaulting to the previous hardcoded values. Setting a field to `0` disables the bonus/penalty it controls — setting every field to `0` reduces a habit to a plain sum of its entry values with a streak and no score bonuses, and the `scoreBreakdown` tiers are omitted entirely when the day/streak bonus is disabled.

Habit entries also no longer require a frontmatter value of 10 or less — the upper bound is removed so a habit can track an unbounded quantity like a dollar amount (a value below 1 is still rejected).
