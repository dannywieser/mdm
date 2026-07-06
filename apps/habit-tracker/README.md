# habit-tracker

Express-based API for tracking configurable habits scored from note frontmatter.

## Endpoints

- `GET /health`
  - Purpose: verifies the vault directory (`NOTES_ROOT`) is readable
  - Success response: `200`
    ```json
    { "status": "ok" }
    ```
  - Error response: `503` when config can't be resolved or the vault directory isn't readable
    ```json
    { "status": "error", "error": "ENOENT: no such file or directory, access '/data/notes'" }
    ```
- `GET /habits`
  - Purpose: list every habit configured under `habits` in `app.config.json`, each with its current score, streak, mode, tracking-window entry count, and `targetScore` — intended for rendering a lightweight overview (for example a grid of habit cards) without the per-habit cost of computing full history
  - `targetScore` is omitted from the response (rather than appearing as `null`) for habits where it isn't configured, since `JSON.stringify` drops `undefined` properties
  - `windowEntries` is the count of distinct days with a logged entry within the current `trackingWindowDays` window
  - Success response: `200`
    ```json
    [
      {
        "habitId": "exercise",
        "habitName": "Daily Exercise",
        "habitScore": 525,
        "mode": "do-more",
        "streak": 5,
        "windowEntries": 5
      },
      {
        "habitId": "drinking",
        "habitName": "drinking",
        "habitScore": 38,
        "mode": "do-less",
        "streak": 2,
        "targetScore": 100,
        "windowEntries": 3
      }
    ]
    ```
  - Sample curl command:
    ```bash
    curl http://localhost/habits
    ```
- `GET /habits/:id`
  - Purpose: load the habit configured under `habits` in `app.config.json` (matched by `id`), scan notes for the configured `frontmatterProperty` (a numeric value from 1–10), and return the current score, streak, entry count, a point-in-time history for every day from the first matching note through today, a dedicated streak-period breakdown, and all-time highs
  - `mode` and `targetScore` are passed through from the habit's configuration. `targetScore` is only meaningful for `do-less` habits — it defines the score thresholds a UI can use to render a green/yellow/red status (for example a `targetScore` of `100` implies green for scores up to `50`, yellow up to `75`, and red from `75` upward) — and is omitted from the response (rather than appearing as `null`) when not configured, since `JSON.stringify` drops `undefined` properties
  - Scoring: sums frontmatter values from notes within the rolling `trackingWindowDays` window (entries from the last 14 days count at a 10x multiplier) to get a base total, then multiplies it by `(1 + dayMultiplier) * (1 + streakMultiplier)`. Both multipliers use the same *tiered* per-day rate, not a flat one: 0.5% for each of the first 5 days/streak-days, 0.6% for each of the next 5, +0.1% per additional 5-day tier beyond that — so 5 days/streak-days contributes 2.5% (5 × 0.5%), but 10 contributes 5.5% (5 × 0.5% + 5 × 0.6%), not the 5% a flat rate would imply. `dayMultiplier` sums this tiered rate across the distinct days-with-an-entry in the window (always a positive adjustment, in both modes); `streakMultiplier` sums it across the current streak length, applied as a bonus for `do-more` habits and a penalty for `do-less` habits. Final scores are floored to whole numbers.
  - The top-level `streak` reflects the current streak as of the reference date. Its definition depends on mode:
    - `do-more` habits: the number of consecutive days (ending on the reference date) with an entry — reported as `0` until at least 2 consecutive days have been logged, since a single logged day hasn't yet spanned a full day-to-day gap and shouldn't read as an established streak.
    - `do-less` habits: the number of days since the most recent entry (an entry on today's date resets it to `0`).
  - `streaks` is a dedicated breakdown of historical streak periods, each with `start`, `end`, and `length` (in days):
    - `do-more` habits: periods of consecutive days with a logged entry.
    - `do-less` habits: gaps of consecutive days without a logged entry that fall strictly between two logged entries (the time before the first entry and the ongoing gap since the most recent entry are excluded).
  - `allTimeHighStreak` is the longest `length` across all entries in `streaks`.
  - `lowestDaysTrackedPerPeriod` (`do-less` habits only) is the fewest unique tracked days seen across any complete `trackingWindowDays`-length period, walking backwards from the reference date. A trailing period that starts before the first tracked entry is only partial and is discarded rather than counted as-is, so the field is omitted entirely once there's at least one entry but no complete period has elapsed yet. If the habit has zero logged entries at all, the field is `0` rather than omitted.
  - `trackingWindowDays` echoes back the habit's configured window size, alongside the top-level `mode` and `targetScore` pass-through.
  - The current `habitScore` and each `history` entry's `habitScore` also include a score breakdown:
    - `rawScore`: the sum of entry values in the tracking window with no recency multiplier applied
    - `recentEntryAdditions`: the extra amount contributed by entries within the last 14 days (each counts at 10x, so this is `entry.value * 9` summed across those entries)
    - `scoreBeforeMultipliers`: `rawScore + recentEntryAdditions` — the base total before the day/streak adjustments are applied
    - `streakMultiplier` / `dayMultiplier`: the tiered adjustments described above
    - The final `habitScore` is `floor(scoreBeforeMultipliers * (1 + dayMultiplier) * (1 + streakMultiplier))` — the two adjustments are applied as multiplicative factors, not summed
  - The current `habitScore` (but not each `history` entry) additionally includes `scoreBreakdown`, a tier-by-tier accounting of how `dayMultiplier`/`streakMultiplier` were built: `entryScores` (equal to `scoreBeforeMultipliers`), plus `daysTiers` and `streakTiers` — each an array of `{ startDay, endDay, rate, days, amount }` objects, one per 5-day tier, describing that tier's day range, rate, day count, and dollar-amount contribution to the score
  - `history` contains one entry for every calendar day from the first matching note through the reference date (inclusive) — not just days with a logged entry — so it can be plotted as a continuous score-over-time graph. Each entry also includes `streak` (the streak as of that day, using the same mode-specific definition as the top-level `streak`) and `value`, the frontmatter value logged that day (`0` on days with no entry; entries on the same date are summed)
  - `scoreEntries` is a per-entry breakdown of the entries contributing to the current `habitScore`, most recent first. Each entry has `date`, `value` (the raw frontmatter value logged that day), `recentMultiplier` — `10` if the entry falls within the last 14 days (and so contributes to `recentEntryAdditions`), or omitted otherwise — and `obsidianUrl`, an `obsidian://` deep link to the note the entry was read from
  - Success response: `200`
    ```json
    {
      "habitId": "exercise",
      "habitName": "Daily Exercise",
      "mode": "do-more",
      "trackingWindowDays": 30,
      "windowStart": "2026-03-08",
      "habitScore": 525,
      "streak": 5,
      "windowEntries": 5,
      "rawScore": 50,
      "recentEntryAdditions": 450,
      "scoreBeforeMultipliers": 500,
      "streakMultiplier": 0.025,
      "dayMultiplier": 0.025,
      "scoreBreakdown": {
        "entryScores": 500,
        "daysTiers": [
          { "startDay": 1, "endDay": 5, "rate": 0.005, "days": 5, "amount": 12.5 }
        ],
        "streakTiers": [
          { "startDay": 1, "endDay": 5, "rate": 0.005, "days": 5, "amount": 12.8125 }
        ]
      },
      "history": [
        {
          "date": "2026-01-01",
          "habitScore": 100,
          "streak": 0,
          "windowEntries": 1,
          "windowStart": "2025-10-03",
          "value": 10,
          "rawScore": 10,
          "recentEntryAdditions": 90,
          "scoreBeforeMultipliers": 100,
          "streakMultiplier": 0,
          "dayMultiplier": 0.005
        },
        {
          "date": "2026-01-02",
          "habitScore": 0,
          "streak": 0,
          "windowEntries": 1,
          "windowStart": "2025-10-04",
          "value": 0,
          "rawScore": 10,
          "recentEntryAdditions": 90,
          "scoreBeforeMultipliers": 100,
          "streakMultiplier": 0,
          "dayMultiplier": 0.005
        }
      ],
      "streaks": [
        { "start": "2026-01-01", "end": "2026-01-05", "length": 5 }
      ],
      "scoreEntries": [
        { "date": "2026-03-12", "value": 10, "recentMultiplier": 10, "obsidianUrl": "obsidian://open?vault=notes&file=2026.03.12" },
        { "date": "2026-03-08", "value": 10, "obsidianUrl": "obsidian://open?vault=notes&file=2026.03.08" }
      ],
      "allTimeHighScore": 525,
      "allTimeHighStreak": 5,
      "allTimeHighWindowEntries": 5
    }
    ```
  - Error response (unknown habit id): `404`
    ```json
    { "error": "Habit not found: <id>" }
    ```
  - Sample curl command:
    ```bash
    curl http://localhost/habits/exercise
    ```

## Configuration

- `habits` (optional): array of habit configs consumed by `GET /habits` and `GET /habits/:id`. Each habit has:
  - `id`: route key used by `GET /habits/:id`
  - `name`: human-readable label returned in the response
  - `mode`: `"do-more"` or `"do-less"` — controls whether the streak adjustment (`streakMultiplier`) boosts or lowers the score; the days-with-entries adjustment (`dayMultiplier`) is always positive in both modes (see scoring details above)
  - `frontmatterProperty`: frontmatter key holding a numeric value from 1–10 to track
  - `trackingWindowDays`: size (in days) of the rolling window used to score the habit — must be a positive integer
  - `targetScore` (optional, positive number): only meaningful for `do-less` habits — defines the score thresholds a UI can use to render a green/yellow/red status. A `targetScore` of `100` implies green for scores up to `50` (50% of target), yellow up to `75` (75% of target), and red from `75` upward
