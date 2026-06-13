# habit-tracker

## 1.2.1

### Patch Changes

- 957fdaa: Add a shared `services` package with per-domain (notes, habits, flags, images) response types and React Query hooks, removing duplicated and drifted type definitions from `apps/web` and the API apps. The web app now consumes shared `useNotesQuery`, `useViewsQuery`, `useStatsQuery`, `useHabitsQuery`, `useHabitQuery`, `useIsRead`, and `useToggleNoteRead` hooks, and `apps/notes-api`, `apps/habit-tracker`, and `apps/flag-manager` re-export their wire-shape types from `services` so handler outputs are checked against the shared contract. The habit history/score API responses now consistently include the full set of fields (`windowEntries`, `windowStart`, `rawScore`, `scoreBeforeMultipliers`, `streakMultiplier`, `dayMultiplier`, `recentEntryAdditions`) that were previously typed inconsistently between client and server.
- Updated dependencies [da76fb7]
- Updated dependencies [957fdaa]
  - markdown@1.8.0
  - services@1.8.0
  - app-config@1.8.0
  - mdm-util@1.8.0

## 1.2.0

### Minor Changes

- 88032d0: Renamed the `GET /habit/:id` endpoint to `GET /habits/:id` for REST consistency with `GET /habits`, and consolidated the `habit` and `habits` handler folders into `habits` and `habit-detail`.

### Patch Changes

- 88032d0: Moved shared markdown file-loading helpers (`collectMarkdownFiles`, `buildObsidianUrl`, `resolveDateFromFrontmatterOrTitle`) into the `markdown` package and updated `notes-api` and `habit-tracker` to use them, removing duplicated implementations.
- Updated dependencies [88032d0]
  - markdown@1.7.0
  - app-config@1.7.0
  - mdm-util@1.7.0

## 1.1.1

### Patch Changes

- 077d2eb: Redesign the home page habit cards as multi-stat boxes showing habit score, streak, and total days, prefix the title with "do more"/"do less", and show heat dots for over-target do-less habits (matching the detail page). Add `windowEntries` to the `/habits` list response to support the new "total days" stat.
- 077d2eb: Add a percentage badge next to "days logged" on the habit detail page showing how full the current tracking window is (logged days / window size). The `/habit/:id` response now includes `trackingWindowDays` to support this.
- Updated dependencies [4894c0a]
  - app-config@1.6.1
  - markdown@1.6.1
  - mdm-util@1.6.1

## 1.1.0

### Minor Changes

- 1edfc02: Add an optional `targetScore` to habit configuration (used by `do-less` habits to define green/yellow/red score thresholds for the UI), include `mode`, `targetScore`, and a `scoreEntries` per-entry breakdown of the current score (date, raw value, recency multiplier, and an `obsidianUrl` deep link to the source note) in the `GET /habit/:id` response, and add a new `GET /habits` endpoint that lists every configured habit with its current score, streak, mode, and `targetScore`.
- be835c4: Implement the `GET /habit/:id` endpoint. Habits are configured in `app.config.json` under a new `habits` array, each with an `id`, `name`, `mode` (`"do-more"` or `"do-less"`), `frontmatterProperty`, and `trackingWindowDays`. The endpoint scans notes for the configured frontmatter property (a numeric value from 1–10) and returns the current rolling-window score, streak, and entry count, plus a point-in-time history for every matching note and all-time highs for score, streak, and tracking-window entries. Scoring sums values from notes within the tracking window (entries from the last 14 days count at a 10x multiplier), then applies an always-positive 0.5%-per-day-with-an-entry adjustment and a 0.5%-per-streak-day adjustment that boosts the score (do-more) or lowers it (do-less).

### Patch Changes

- be835c4: Fix `GET /habit/:id` failing to count entries whose frontmatter property value is wrapped in quotes (for example `drinking: "3"`). The quoted string was passed directly to `parseFloat`, which returned `NaN` and caused the entry to be silently dropped.
- be835c4: Floor `GET /habit/:id` scores (current score and history scores) to whole numbers, correcting for floating-point representation noise so values like `524.9999999999999` floor to the mathematically exact `525` rather than `524`.
- be835c4: Fix the sign of the `streakMultiplier` and `dayMultiplier` score contributions for `do-less` habits in the `GET /habit/:id` response. `dayMultiplier` is now always positive in both modes (more days with entries always raises the score before the streak adjustment), while `streakMultiplier` is positive for `do-more` habits and negative for `do-less` habits (a long gap since the last entry now lowers the score, as intended).
- be835c4: Change `history` in the `GET /habit/:id` response to include one record for every calendar day from the first matching note through today (rather than only days with a logged entry), so it can be plotted as a continuous score-over-time graph. Days with no logged entry have `value: 0` and a score computed normally as of that day. Each `history` entry now also includes `streak`, the streak as of that day.
- be835c4: Add a dedicated `streaks` block to the `GET /habit/:id` response describing historical streak periods (`start`/`end`/`length`): for `do-more` habits these are periods of consecutive logged days, and for `do-less` habits these are gaps of consecutive unlogged days that fall strictly between two logged entries. The top-level `streak` field continues to reflect the current streak (consecutive logged days for `do-more`, days since the last entry for `do-less`), and `allTimeHighStreak` is now derived from the longest entry in `streaks`.
- be835c4: Change how `dayMultiplier` and `streakMultiplier` combine in the `GET /habit/:id` score formula: `habitScore` is now `floor(scoreBeforeMultipliers * (1 + dayMultiplier) * (1 + streakMultiplier))` (multiplicative) rather than `floor(scoreBeforeMultipliers * (1 + dayMultiplier + streakMultiplier))` (additive), so the result matches the original ad-hoc scoring logic. The two approaches agree in most cases but can differ by 1 near floor boundaries due to the cross term between the two adjustments.
- be835c4: Add a score breakdown to the `GET /habit/:id` response — `rawScore` (entry values with no recency multiplier), `recentEntryAdditions` (the extra amount contributed by entries within the last 14 days), `scoreBeforeMultipliers` (`rawScore + recentEntryAdditions`), `streakMultiplier` (positive for `do-more` habits, negative for `do-less` habits), and `dayMultiplier` (always positive, reflecting how many days in the window have a logged entry) are now included on both the current score and every `history` entry. Each `history` entry also now includes `value`, the frontmatter value logged on that day.
- be835c4: Rename `score` to `habitScore`, `totalScore` to `scoreBeforeMultipliers`, and `totalEntries` to `windowEntries` in the `GET /habit/:id` response — both at the top level and (where applicable) in each `history` entry — to better reflect what each value represents.
- Updated dependencies [1edfc02]
- Updated dependencies [6e3255f]
- Updated dependencies [be835c4]
- Updated dependencies [be835c4]
- Updated dependencies [ceb2a80]
- Updated dependencies [f97b7a0]
  - app-config@1.6.0
  - mdm-util@1.6.0
  - markdown@1.6.0

## 1.0.0

### Major Changes

- Added the initial Express-based habit tracker stub with health and placeholder habit endpoints.
