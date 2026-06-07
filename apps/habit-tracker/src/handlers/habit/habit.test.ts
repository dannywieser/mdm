import { AppConfigError, resolveNotesConfig } from "app-config"

import type { HabitEntry, HabitResult } from "./habit.types"

import { habitHandler } from "./habit"
import { collectMarkdownFiles, scanHabitEntries } from "./habit.files"
import {
  addDays,
  buildHistory,
  calculateBaseScore,
  calculateConsecutiveEntryStreak,
  calculateDaysBetweenEntries,
  calculateDaysSinceLastEntry,
  calculateHabitScore,
  calculateStreak,
  getWindowEntries,
} from "./habit.util"

vi.mock("app-config", () => ({
  AppConfigError: class AppConfigError extends Error {},
  resolveNotesConfig: vi.fn(),
}))

vi.mock("./habit.files", () => ({
  collectMarkdownFiles: vi.fn(),
  scanHabitEntries: vi.fn(),
}))

// ---------------------------------------------------------------------------
// Test data helpers
// ---------------------------------------------------------------------------

const makeEntry = (date: string, value: number): HabitEntry => ({ date, value })

const makeRequest = (id: string) => ({ params: { id } }) as never

const makeResponse = () => {
  const json = vi.fn<(payload: HabitResult | { error: string }) => void>()
  const status = vi.fn().mockReturnValue({ json })
  return { response: { status } as never, status, json }
}

const getJsonResult = (json: ReturnType<typeof makeResponse>["json"]): HabitResult => {
  const [[payload]] = json.mock.calls
  return payload as HabitResult
}

const BASE_CONFIG = {
  createdDateProperty: "created",
  dateFormats: ["YYYY.MM.DD"],
  deriveTitleDate: false,
  notesDirectory: "/notes",
  obsidianVault: "vault",
  timezone: "UTC",
  attachmentsDirectory: "attachments",
  homeStats: { show: {} },
  views: [],
}

const HABIT_DO_MORE = {
  id: "exercise",
  name: "Exercise",
  mode: "do-more" as const,
  frontmatterProperty: "exercise",
  trackingWindowDays: 30,
}

const HABIT_DO_LESS = {
  id: "stress",
  name: "Stress",
  mode: "do-less" as const,
  frontmatterProperty: "stress",
  trackingWindowDays: 30,
}

// ---------------------------------------------------------------------------
// Generate a large year-long dataset (2025-01-01 to 2025-12-31)
// Pattern: every day except the last day of each month and every Sunday
// Values cycle 1–10 by day-of-year index
// ---------------------------------------------------------------------------

const YEAR_START = "2025-01-01"

const generateYearEntries = (): HabitEntry[] => {
  const entries: HabitEntry[] = []
  for (let i = 0; i < 365; i++) {
    const date = addDays(YEAR_START, i)
    const dayOfWeek = new Date(date + "T00:00:00Z").getUTCDay() // 0 = Sunday
    const dayOfMonth = new Date(date + "T00:00:00Z").getUTCDate()
    const daysInMonth = new Date(
      new Date(date + "T00:00:00Z").getUTCFullYear(),
      new Date(date + "T00:00:00Z").getUTCMonth() + 1,
      0,
    ).getDate()
    // Skip Sundays and last day of each month to create controlled gaps
    if (dayOfWeek === 0 || dayOfMonth === daysInMonth) continue
    entries.push(makeEntry(date, (i % 10) + 1))
  }
  return entries
}

const YEAR_ENTRIES = generateYearEntries()

// ---------------------------------------------------------------------------
// addDays
// ---------------------------------------------------------------------------

describe("addDays", () => {
  test("adds positive days", () => {
    expect(addDays("2025-01-01", 10)).toBe("2025-01-11")
  })

  test("subtracts negative days", () => {
    expect(addDays("2025-01-11", -10)).toBe("2025-01-01")
  })

  test("crosses month boundary", () => {
    expect(addDays("2025-01-31", 1)).toBe("2025-02-01")
  })

  test("crosses year boundary", () => {
    expect(addDays("2024-12-31", 1)).toBe("2025-01-01")
  })

  test("handles zero days", () => {
    expect(addDays("2025-06-15", 0)).toBe("2025-06-15")
  })
})

// ---------------------------------------------------------------------------
// getWindowEntries
// ---------------------------------------------------------------------------

describe("getWindowEntries", () => {
  const entries = [
    makeEntry("2025-01-01", 5),
    makeEntry("2025-01-10", 7),
    makeEntry("2025-01-20", 3),
    makeEntry("2025-01-31", 8),
  ]

  test("includes entries within window", () => {
    const result = getWindowEntries(entries, "2025-01-20", 30)
    expect(result.map((e) => e.date)).toContain("2025-01-01")
    expect(result.map((e) => e.date)).toContain("2025-01-10")
    expect(result.map((e) => e.date)).toContain("2025-01-20")
  })

  test("excludes entries outside window", () => {
    const result = getWindowEntries(entries, "2025-01-20", 10)
    expect(result.map((e) => e.date)).not.toContain("2025-01-01")
    expect(result.map((e) => e.date)).toContain("2025-01-10")
    expect(result.map((e) => e.date)).toContain("2025-01-20")
  })

  test("excludes future entries", () => {
    const result = getWindowEntries(entries, "2025-01-20", 30)
    expect(result.map((e) => e.date)).not.toContain("2025-01-31")
  })

  test("returns empty array when no entries in window", () => {
    const result = getWindowEntries(entries, "2024-12-31", 30)
    expect(result).toHaveLength(0)
  })

  test("window boundary is inclusive on both ends", () => {
    // 10-day window from 2025-01-10 back to 2024-12-31
    const result = getWindowEntries(entries, "2025-01-10", 10)
    expect(result.map((e) => e.date)).toContain("2025-01-01")
    expect(result.map((e) => e.date)).toContain("2025-01-10")
  })
})

// ---------------------------------------------------------------------------
// calculateStreak
// ---------------------------------------------------------------------------

describe("calculateConsecutiveEntryStreak (do-more streak)", () => {
  test("counts consecutive days ending on reference date", () => {
    const entries = [
      makeEntry("2025-01-08", 5),
      makeEntry("2025-01-09", 5),
      makeEntry("2025-01-10", 5),
    ]
    expect(calculateConsecutiveEntryStreak(entries, "2025-01-10")).toBe(3)
  })

  test("returns 0 when no entry on reference date", () => {
    const entries = [makeEntry("2025-01-08", 5), makeEntry("2025-01-09", 5)]
    expect(calculateConsecutiveEntryStreak(entries, "2025-01-10")).toBe(0)
  })

  test("stops counting at gap", () => {
    const entries = [
      makeEntry("2025-01-06", 5),
      makeEntry("2025-01-08", 5),
      makeEntry("2025-01-09", 5),
      makeEntry("2025-01-10", 5),
    ]
    expect(calculateConsecutiveEntryStreak(entries, "2025-01-10")).toBe(3)
  })

  test("returns 1 for single entry on reference date", () => {
    expect(calculateConsecutiveEntryStreak([makeEntry("2025-01-10", 5)], "2025-01-10")).toBe(1)
  })

  test("ignores future entries when calculating streak", () => {
    const entries = [
      makeEntry("2025-01-08", 5),
      makeEntry("2025-01-09", 5),
      makeEntry("2025-01-10", 5),
      makeEntry("2025-01-11", 5), // future
    ]
    expect(calculateConsecutiveEntryStreak(entries, "2025-01-10")).toBe(3)
  })

  test("multiple entries on same day count as one streak day", () => {
    const entries = [
      makeEntry("2025-01-09", 3),
      makeEntry("2025-01-09", 7), // duplicate date
      makeEntry("2025-01-10", 5),
    ]
    expect(calculateConsecutiveEntryStreak(entries, "2025-01-10")).toBe(2)
  })
})

describe("calculateDaysSinceLastEntry (do-less streak)", () => {
  test("counts days since the most recent entry on or before the reference date", () => {
    const entries = [makeEntry("2025-01-05", 5), makeEntry("2025-01-08", 3)]
    expect(calculateDaysSinceLastEntry(entries, "2025-01-12")).toBe(4)
  })

  test("returns 0 when there is an entry on the reference date", () => {
    const entries = [makeEntry("2025-01-08", 3), makeEntry("2025-01-10", 5)]
    expect(calculateDaysSinceLastEntry(entries, "2025-01-10")).toBe(0)
  })

  test("returns 0 when there are no entries on or before the reference date", () => {
    const entries = [makeEntry("2025-01-15", 5)] // future relative to reference date
    expect(calculateDaysSinceLastEntry(entries, "2025-01-10")).toBe(0)
  })

  test("ignores future entries when finding the most recent entry", () => {
    const entries = [makeEntry("2025-01-05", 5), makeEntry("2025-01-20", 5)]
    expect(calculateDaysSinceLastEntry(entries, "2025-01-10")).toBe(5)
  })

  test("uses the latest of multiple entries on the same date", () => {
    const entries = [
      makeEntry("2025-01-05", 5),
      makeEntry("2025-01-05", 3),
      makeEntry("2025-01-08", 1),
    ]
    expect(calculateDaysSinceLastEntry(entries, "2025-01-12")).toBe(4)
  })
})

describe("calculateDaysBetweenEntries (do-less historical streak)", () => {
  test("counts days between this entry and the previous one", () => {
    const entries = [makeEntry("2025-01-05", 5), makeEntry("2025-01-12", 3)]
    expect(calculateDaysBetweenEntries(entries, "2025-01-12")).toBe(7)
  })

  test("returns 0 for the earliest entry (no previous entry to compare against)", () => {
    const entries = [makeEntry("2025-01-05", 5), makeEntry("2025-01-12", 3)]
    expect(calculateDaysBetweenEntries(entries, "2025-01-05")).toBe(0)
  })

  test("ignores entries on the reference date itself when finding the previous entry", () => {
    const entries = [
      makeEntry("2025-01-05", 5),
      makeEntry("2025-01-12", 3),
      makeEntry("2025-01-12", 1), // duplicate date, should not be treated as "previous"
    ]
    expect(calculateDaysBetweenEntries(entries, "2025-01-12")).toBe(7)
  })

  test("ignores future entries when finding the previous entry", () => {
    const entries = [
      makeEntry("2025-01-05", 5),
      makeEntry("2025-01-12", 3),
      makeEntry("2025-01-20", 1), // after the reference date
    ]
    expect(calculateDaysBetweenEntries(entries, "2025-01-12")).toBe(7)
  })
})

describe("calculateStreak (mode dispatch)", () => {
  const entries = [makeEntry("2025-01-05", 5), makeEntry("2025-01-10", 3)]

  test("uses the consecutive-entry streak for do-more habits regardless of streak context", () => {
    expect(calculateStreak(entries, "2025-01-10", "do-more", "current")).toBe(
      calculateConsecutiveEntryStreak(entries, "2025-01-10"),
    )
    expect(calculateStreak(entries, "2025-01-10", "do-more", "history")).toBe(
      calculateConsecutiveEntryStreak(entries, "2025-01-10"),
    )
  })

  test("uses the days-since-last-entry streak for do-less habits in the current context", () => {
    expect(calculateStreak(entries, "2025-01-12", "do-less", "current")).toBe(
      calculateDaysSinceLastEntry(entries, "2025-01-12"),
    )
  })

  test("uses the days-between-entries streak for do-less habits in the history context", () => {
    expect(calculateStreak(entries, "2025-01-10", "do-less", "history")).toBe(
      calculateDaysBetweenEntries(entries, "2025-01-10"),
    )
  })
})

// ---------------------------------------------------------------------------
// calculateBaseScore
// ---------------------------------------------------------------------------

describe("calculateBaseScore", () => {
  test("applies 10x multiplier for entries in last 14 days", () => {
    const entries = [makeEntry("2025-01-10", 5)]
    // reference date = "2025-01-10", recentCutoff = "2024-12-27"
    // entry is recent → 5 * 10 = 50
    expect(calculateBaseScore(entries, "2025-01-10")).toBe(50)
  })

  test("applies 1x multiplier for entries older than 14 days", () => {
    const entries = [makeEntry("2024-12-20", 5)]
    // reference date = "2025-01-10", recentCutoff = "2024-12-27"
    // entry is NOT recent → 5 * 1 = 5
    expect(calculateBaseScore(entries, "2025-01-10")).toBe(5)
  })

  test("applies correct multipliers on boundary (14 days ago is not recent)", () => {
    // recentCutoff = addDays("2025-01-14", -14) = "2024-12-31"
    // entry on "2024-12-31": 2024-12-31 > 2024-12-31 is false → not recent (1x)
    // entry on "2025-01-01": 2025-01-01 > 2024-12-31 is true → recent (10x)
    const refDate = "2025-01-14"
    const oldEntry = [makeEntry("2024-12-31", 5)]
    const recentEntry = [makeEntry("2025-01-01", 5)]
    expect(calculateBaseScore(oldEntry, refDate)).toBe(5)
    expect(calculateBaseScore(recentEntry, refDate)).toBe(50)
  })

  test("sums multiple entries with correct multipliers", () => {
    const refDate = "2025-01-20"
    // recentCutoff = addDays("2025-01-20", -14) = "2025-01-06"
    const entries = [
      makeEntry("2025-01-05", 3), // older than 14 days → 3 * 1 = 3
      makeEntry("2025-01-07", 4), // recent → 4 * 10 = 40
      makeEntry("2025-01-20", 2), // recent → 2 * 10 = 20
    ]
    expect(calculateBaseScore(entries, refDate)).toBe(63)
  })

  test("returns 0 for empty entries", () => {
    expect(calculateBaseScore([], "2025-01-10")).toBe(0)
  })
})

// ---------------------------------------------------------------------------
// calculateHabitScore
// ---------------------------------------------------------------------------

describe("calculateHabitScore", () => {
  test("do-more: applies streak and window-days bonus", () => {
    // 5 consecutive days of entries, value 10 each, all recent
    const refDate = "2025-01-05"
    const entries = [
      makeEntry("2025-01-01", 10),
      makeEntry("2025-01-02", 10),
      makeEntry("2025-01-03", 10),
      makeEntry("2025-01-04", 10),
      makeEntry("2025-01-05", 10),
    ]
    const { score, streak, uniqueWindowDays } = calculateHabitScore(
      entries,
      refDate,
      30,
      "do-more",
      "current",
    )
    // baseScore = 5 * 10 * 10 = 500 (all recent)
    // streak = 5 → streakBonus = 5 * 0.005 = 0.025
    // uniqueWindowDays = 5 → modeAdjustment = 5 * 0.005 = 0.025
    // score = 500 * (1 + 0.025 + 0.025) = 500 * 1.05 = 525, floored to 525
    expect(streak).toBe(5)
    expect(uniqueWindowDays).toBe(5)
    expect(score).toBe(525)
  })

  test("do-less: streak is days since the last entry, applied alongside the window-days penalty", () => {
    const refDate = "2025-01-10"
    const entries = [
      makeEntry("2025-01-01", 10),
      makeEntry("2025-01-02", 10),
      makeEntry("2025-01-03", 10),
      makeEntry("2025-01-04", 10),
      makeEntry("2025-01-05", 10), // most recent entry, 5 days before refDate
    ]
    const { score, streak } = calculateHabitScore(entries, refDate, 30, "do-less", "current")
    // baseScore = 5 * 10 * 10 = 500 (all within the recent 14-day window)
    // streak = days since last entry (2025-01-05 → 2025-01-10) = 5 → streakBonus = 0.025
    // uniqueWindowDays = 5 → modeAdjustment = -0.025
    // score = 500 * (1 + 0.025 - 0.025) = 500 * 1.0 = 500, floored to 500
    expect(streak).toBe(5)
    expect(score).toBe(500)
  })

  test("do-less: a fresh entry on the reference date resets the streak to 0", () => {
    const refDate = "2025-01-10"
    const entries = [
      makeEntry("2025-01-05", 10),
      makeEntry("2025-01-10", 10),
    ]
    const { streak } = calculateHabitScore(entries, refDate, 30, "do-less", "current")
    expect(streak).toBe(0)
  })

  test("score is 0 when no entries", () => {
    const { score, streak, uniqueWindowDays } = calculateHabitScore(
      [],
      "2025-01-10",
      30,
      "do-more",
      "current",
    )
    expect(score).toBe(0)
    expect(streak).toBe(0)
    expect(uniqueWindowDays).toBe(0)
  })

  test("windowStart is trackingWindowDays before referenceDate", () => {
    const { windowStart } = calculateHabitScore([], "2025-03-31", 90, "do-more", "current")
    expect(windowStart).toBe("2024-12-31")
  })

  test("entries outside tracking window are excluded", () => {
    const refDate = "2025-01-31"
    const entries = [
      makeEntry("2024-12-01", 10), // outside 30-day window
      makeEntry("2025-01-15", 5),  // inside window, but older than 14 days → 1x
      makeEntry("2025-01-31", 8),  // inside window, recent → 10x
    ]
    const { score, uniqueWindowDays } = calculateHabitScore(entries, refDate, 30, "do-more", "current")
    // windowStart = addDays("2025-01-31", -30) = "2025-01-01"
    // recentCutoff = addDays("2025-01-31", -14) = "2025-01-17"
    // 2025-01-15 < recentCutoff → 5 * 1 = 5
    // 2025-01-31 > recentCutoff → 8 * 10 = 80
    // baseScore = 85, streak = 1 (Jan 30 missing), uniqueWindowDays = 2
    // streakBonus = 0.005, modeAdjustment = 0.01
    // score = 85 * 1.015 = 86.275, floored to 86
    expect(uniqueWindowDays).toBe(2)
    expect(score).toBe(Math.floor(85 * (1 + 0.005 + 0.01)))
  })

  test("streak bonus example from spec: 10-day streak contributes a 5% bonus", () => {
    // 10 consecutive days with value 1, all recent, do-more with 30 window days
    // baseScore = 10 * 1 * 10 = 100
    // streak = 10 consecutive days with entries → streakBonus = 10 * 0.005 = 0.05 (the spec's "5% bonus")
    // uniqueWindowDays = 10 → modeAdjustment (do-more) = 10 * 0.005 = 0.05
    // final = 100 * (1 + 0.05 + 0.05) = 100 * 1.10 = 110
    const refDate = addDays(YEAR_START, 9)
    const entries = Array.from({ length: 10 }, (_, i) =>
      makeEntry(addDays(YEAR_START, i), 1),
    )
    const { score, streak } = calculateHabitScore(entries, refDate, 30, "do-more", "current")
    expect(streak).toBe(10)
    expect(score).toBe(110)
  })

  test("do-less streak example: a 10-day gap since the last entry contributes a 5% bonus", () => {
    // Single entry 10 days before the reference date, do-less with 30 window days
    // baseScore = 1 * 10 = 10 (within the recent 14-day window)
    // streak = days since last entry = 10 → streakBonus = 10 * 0.005 = 0.05
    // uniqueWindowDays = 1 → modeAdjustment (do-less) = -(1 * 0.005) = -0.005
    // final = 10 * (1 + 0.05 - 0.005) = 10 * 1.045 = 10.45, floored to 10
    const lastEntryDate = addDays(YEAR_START, 0)
    const refDate = addDays(YEAR_START, 10)
    const { score, streak } = calculateHabitScore([makeEntry(lastEntryDate, 1)], refDate, 30, "do-less", "current")
    expect(streak).toBe(10)
    expect(score).toBe(Math.floor(10 * (1 + 0.05 - 0.005)))
  })
})

// ---------------------------------------------------------------------------
// buildHistory
// ---------------------------------------------------------------------------

describe("buildHistory", () => {
  test("returns one entry per unique date, sorted ascending", () => {
    const entries = [
      makeEntry("2025-01-03", 5),
      makeEntry("2025-01-01", 3),
      makeEntry("2025-01-02", 7),
    ]
    const history = buildHistory(entries, 30, "do-more")
    expect(history.map((h) => h.date)).toEqual([
      "2025-01-01",
      "2025-01-02",
      "2025-01-03",
    ])
  })

  test("collapses multiple entries on the same date to one history entry", () => {
    const entries = [
      makeEntry("2025-01-10", 3),
      makeEntry("2025-01-10", 7), // same date
    ]
    const history = buildHistory(entries, 30, "do-more")
    expect(history).toHaveLength(1)
    expect(history[0]?.date).toBe("2025-01-10")
  })

  test("each history entry is point-in-time (future entries not counted)", () => {
    const entries = [
      makeEntry("2025-01-01", 5),
      makeEntry("2025-01-05", 5),
      makeEntry("2025-01-10", 5),
    ]
    const history = buildHistory(entries, 30, "do-more")

    // At 2025-01-01: only one entry in window → streak=1, windowEntries=1
    expect(history[0]?.windowEntries).toBe(1)
    expect(history[0]?.streak).toBe(1)

    // At 2025-01-10: three entries in window, but streak=1 (no Jan 9)
    expect(history[2]?.windowEntries).toBe(3)
    expect(history[2]?.streak).toBe(1)
  })

  test("do-less history streak is the gap between consecutive entries, not days-since-last", () => {
    const entries = [
      makeEntry("2025-01-01", 5),
      makeEntry("2025-01-08", 3), // 7 days after the previous entry
      makeEntry("2025-01-10", 1), // 2 days after the previous entry
    ]
    const history = buildHistory(entries, 30, "do-less")

    // First entry has no previous entry to compare against → gap is 0
    expect(history[0]?.streak).toBe(0)
    // Second entry: gap since 2025-01-01 → 7 days
    expect(history[1]?.streak).toBe(7)
    // Third entry: gap since 2025-01-08 → 2 days (NOT 0, even though an entry exists on this date)
    expect(history[2]?.streak).toBe(2)
  })

  test("returns empty array for no entries", () => {
    expect(buildHistory([], 30, "do-more")).toHaveLength(0)
  })
})

// ---------------------------------------------------------------------------
// Large dataset: 365 days of entries across 2025
// ---------------------------------------------------------------------------

describe("year-long dataset (2025)", () => {
  test("generates expected number of entries (skipping Sundays and month-end days)", () => {
    // 365 days - 52 Sundays - 12 month-end days, with some overlap
    // Exact count depends on calendar; just verify it's substantial
    expect(YEAR_ENTRIES.length).toBeGreaterThan(280)
    expect(YEAR_ENTRIES.length).toBeLessThan(365)
  })

  test("all entry dates fall within 2025", () => {
    for (const entry of YEAR_ENTRIES) {
      expect(entry.date).toMatch(/^2025-/)
    }
  })

  test("all entry values are between 1 and 10", () => {
    for (const entry of YEAR_ENTRIES) {
      expect(entry.value).toBeGreaterThanOrEqual(1)
      expect(entry.value).toBeLessThanOrEqual(10)
    }
  })

  test("history length equals number of unique entry dates", () => {
    const history = buildHistory(YEAR_ENTRIES, 90, "do-more")
    const uniqueDates = new Set(YEAR_ENTRIES.map((e) => e.date)).size
    expect(history).toHaveLength(uniqueDates)
  })

  test("history dates are in ascending order", () => {
    const history = buildHistory(YEAR_ENTRIES, 90, "do-more")
    for (let i = 1; i < history.length; i++) {
      expect(history[i].date > history[i - 1].date).toBe(true)
    }
  })

  test("all-time high score is at least as large as any single history score", () => {
    const history = buildHistory(YEAR_ENTRIES, 90, "do-more")
    const allTimeHigh = history.reduce((max, h) => Math.max(max, h.score), 0)
    for (const h of history) {
      expect(h.score).toBeLessThanOrEqual(allTimeHigh)
    }
  })

  test("all-time high streak is at least as large as any single history streak", () => {
    const history = buildHistory(YEAR_ENTRIES, 90, "do-more")
    const allTimeHighStreak = history.reduce((max, h) => Math.max(max, h.streak), 0)
    for (const h of history) {
      expect(h.streak).toBeLessThanOrEqual(allTimeHighStreak)
    }
  })

  test("streaks reset on Sunday gaps (Sundays are skipped in dataset)", () => {
    const history = buildHistory(YEAR_ENTRIES, 90, "do-more")
    // Since Sundays are missing, streaks can never span across a Sunday
    // 2025-01-05 is Sunday. 2025-01-04 (Saturday) has streak ≤ 6 (Mon-Sat)
    const satEntry = history.find((h) => h.date === "2025-01-04")
    if (satEntry) {
      expect(satEntry.streak).toBeLessThanOrEqual(6)
    }
    // 2025-01-06 (Monday) streak starts fresh after Sunday
    const monEntry = history.find((h) => h.date === "2025-01-06")
    if (monEntry) {
      expect(monEntry.streak).toBe(1)
    }
  })

  test("score increases as more recent entries accumulate (do-more)", () => {
    // Compare score at 30th entry vs 60th entry — later should be higher
    // due to more recent 10x entries and a larger base
    const history = buildHistory(YEAR_ENTRIES, 90, "do-more")
    const score30 = history[29]?.score ?? 0
    const score60 = history[59]?.score ?? 0
    expect(score60).toBeGreaterThan(score30)
  })

  test("do-less score is lower than do-more score for same entries (accumulating penalty)", () => {
    const historyMore = buildHistory(YEAR_ENTRIES, 90, "do-more")
    const historyLess = buildHistory(YEAR_ENTRIES, 90, "do-less")
    // Compare at a mid-year entry where window is full
    const midIdx = Math.floor(historyMore.length / 2)
    const moreScore = historyMore[midIdx]?.score ?? 0
    const lessScore = historyLess[midIdx]?.score ?? 0
    expect(lessScore).toBeLessThan(moreScore)
  })

  test("windowEntries never exceeds trackingWindowDays", () => {
    const windowDays = 30
    const history = buildHistory(YEAR_ENTRIES, windowDays, "do-more")
    for (const h of history) {
      expect(h.windowEntries).toBeLessThanOrEqual(windowDays)
    }
  })

  test("windowStart is always exactly trackingWindowDays before the entry date", () => {
    const windowDays = 90
    const history = buildHistory(YEAR_ENTRIES, windowDays, "do-more")
    for (const h of history) {
      expect(h.windowStart).toBe(addDays(h.date, -windowDays))
    }
  })

  test("scores are non-negative for do-more", () => {
    const history = buildHistory(YEAR_ENTRIES, 90, "do-more")
    for (const h of history) {
      expect(h.score).toBeGreaterThanOrEqual(0)
    }
  })

  test("calculateHabitScore at year end reflects full year of data", () => {
    const refDate = "2025-12-30"
    const { score, streak, uniqueWindowDays } = calculateHabitScore(
      YEAR_ENTRIES,
      refDate,
      90,
      "do-more",
      "current",
    )
    // With 90-day window ending Dec 30, all entries in the window are counted
    expect(uniqueWindowDays).toBeGreaterThan(0)
    expect(score).toBeGreaterThan(0)
    // Recent entries (last 14 days) get 10x, rest get 1x
    // The score should be substantial
    expect(score).toBeGreaterThan(100)
    // Streak should be > 0 since Dec 30 has an entry (it's a Tuesday, not month-end)
    expect(streak).toBeGreaterThan(0)
  })

  test("all-time high score across year is reasonable (do-more, 90-day window)", () => {
    const history = buildHistory(YEAR_ENTRIES, 90, "do-more")
    const allTimeHigh = history.reduce((max, h) => Math.max(max, h.score), 0)
    // With up to 90 entries in window, recent ones at 10x, max value 10:
    // ~14 recent entries * 10 * 10 = 1400, ~76 older * ~5.5 avg = ~418
    // Plus streak (~6 days) and mode bonuses (~45%)
    // Should be well above 1000
    expect(allTimeHigh).toBeGreaterThan(1000)
  })
})

// ---------------------------------------------------------------------------
// habitHandler
// ---------------------------------------------------------------------------

describe("habitHandler", () => {
  const mockConfig = {
    ...BASE_CONFIG,
    habits: [HABIT_DO_MORE, HABIT_DO_LESS],
  }

  const mockEntries: HabitEntry[] = [
    makeEntry("2025-01-01", 8),
    makeEntry("2025-01-02", 6),
    makeEntry("2025-01-03", 9),
  ]

  beforeEach(() => {
    vi.useFakeTimers()
    vi.setSystemTime(new Date("2025-01-03T12:00:00Z"))
    vi.mocked(resolveNotesConfig).mockResolvedValue(mockConfig as never)
    vi.mocked(collectMarkdownFiles).mockResolvedValue([])
    vi.mocked(scanHabitEntries).mockResolvedValue(mockEntries)
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  test("returns 200 with habit result for known habit id", async () => {
    const { response, status, json } = makeResponse()
    await habitHandler(makeRequest("exercise"), response, vi.fn())
    expect(status).toHaveBeenCalledWith(200)
    const result = getJsonResult(json)
    expect(result.habitId).toBe("exercise")
    expect(result.habitName).toBe("Exercise")
    expect(result.history.map((h) => h.date)).toEqual([
      "2025-01-01",
      "2025-01-02",
      "2025-01-03",
    ])
  })

  test("returns 404 for unknown habit id", async () => {
    const { response, status, json } = makeResponse()
    await habitHandler(makeRequest("unknown-habit"), response, vi.fn())
    expect(status).toHaveBeenCalledWith(404)
    expect(json).toHaveBeenCalledWith({ error: "Habit not found: unknown-habit" })
  })

  test("current score reflects entries up to today", async () => {
    const { response, status, json } = makeResponse()
    await habitHandler(makeRequest("exercise"), response, vi.fn())
    expect(status).toHaveBeenCalledWith(200)
    const result = getJsonResult(json)
    // today = 2025-01-03, entries on 2025-01-01, 2025-01-02, 2025-01-03 are all recent
    // baseScore = (8 + 6 + 9) * 10 = 230
    // streak = 3, uniqueWindowDays = 3 (all within 30-day window)
    // do-more: score = 230 * (1 + 3*0.005 + 3*0.005) = 230 * 1.03 = 236.9, floored to 236
    expect(result.score).toBe(Math.floor(230 * 1.03))
    expect(result.streak).toBe(3)
    expect(result.totalEntries).toBe(3)
  })

  test("returns all-time high stats derived from history", async () => {
    const { response, json } = makeResponse()
    await habitHandler(makeRequest("exercise"), response, vi.fn())
    const result = getJsonResult(json)
    expect(result.allTimeHighScore).toBeGreaterThan(0)
    expect(result.allTimeHighStreak).toBeGreaterThanOrEqual(1)
    expect(result.allTimeHighWindowEntries).toBeGreaterThanOrEqual(1)
  })

  test("returns 500 with config error message on AppConfigError", async () => {
    vi.mocked(resolveNotesConfig).mockRejectedValue(
      new AppConfigError("app.config.json is required"),
    )
    const { response, status, json } = makeResponse()
    await habitHandler(makeRequest("exercise"), response, vi.fn())
    expect(status).toHaveBeenCalledWith(500)
    expect(json).toHaveBeenCalledWith({ error: "app.config.json is required" })
  })

  test("returns generic 500 on unexpected error", async () => {
    vi.mocked(resolveNotesConfig).mockRejectedValue(new Error("disk failure"))
    const { response, status, json } = makeResponse()
    await habitHandler(makeRequest("exercise"), response, vi.fn())
    expect(status).toHaveBeenCalledWith(500)
    expect(json).toHaveBeenCalledWith({ error: "Unable to load habit" })
  })

  test("windowStart is trackingWindowDays before today", async () => {
    const { response, json } = makeResponse()
    await habitHandler(makeRequest("exercise"), response, vi.fn())
    const result = getJsonResult(json)
    // today = 2025-01-03, trackingWindowDays = 30
    expect(result.windowStart).toBe("2024-12-04")
  })
})
