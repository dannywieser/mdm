import { AppConfigError, resolveNotesConfig } from "app-config"

import type { HabitEntry } from "../habit-detail/habit-detail.types"
import type { HabitSummary } from "./habits.types"

import { collectMarkdownFiles, scanHabitEntries } from "../habit-detail/habit-detail.files"
import { habitsHandler } from "./habits"

vi.mock("app-config", () => ({
  AppConfigError: class AppConfigError extends Error {},
  resolveNotesConfig: vi.fn(),
}))

vi.mock("../habit-detail/habit-detail.files", () => ({
  collectMarkdownFiles: vi.fn(),
  scanHabitEntries: vi.fn(),
}))

const makeEntry = (date: string, value: number): HabitEntry => ({ date, value })

const makeResponse = () => {
  const json = vi.fn<(payload: HabitSummary[] | { error: string }) => void>()
  const status = vi.fn().mockReturnValue({ json })
  return { response: { status } as never, status, json }
}

const getJsonResult = (json: ReturnType<typeof makeResponse>["json"]): HabitSummary[] => {
  const [[payload]] = json.mock.calls
  return payload as HabitSummary[]
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
  targetScore: 100,
}

describe("habitsHandler", () => {
  beforeEach(() => {
    vi.useFakeTimers()
    vi.setSystemTime(new Date("2025-01-03T00:00:00Z"))
    vi.mocked(collectMarkdownFiles).mockResolvedValue(["/notes/a.md"])
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  test("returns a summary for every configured habit", async () => {
    vi.mocked(resolveNotesConfig).mockResolvedValue({
      ...BASE_CONFIG,
      habits: [HABIT_DO_MORE, HABIT_DO_LESS],
    } as never)
    vi.mocked(scanHabitEntries).mockImplementation((_paths, property) =>
      Promise.resolve(
        property === "exercise"
          ? [makeEntry("2025-01-01", 8), makeEntry("2025-01-02", 6), makeEntry("2025-01-03", 9)]
          : [makeEntry("2025-01-01", 3)],
      ),
    )

    const { response, status, json } = makeResponse()
    await habitsHandler({} as never, response, vi.fn())

    expect(status).toHaveBeenCalledWith(200)
    expect(getJsonResult(json)).toEqual([
      {
        habitId: "exercise",
        habitName: "Exercise",
        // baseScore = (8 + 6 + 9) * 10 = 230, streak = uniqueWindowDays = 3
        // habitScore = floor(230 * 1.015 * 1.015) = floor(236.95175)
        habitScore: Math.floor(230 * 1.015 * 1.015),
        mode: "do-more",
        streak: 3,
        targetScore: undefined,
        windowEntries: 3,
      },
      {
        habitId: "stress",
        habitName: "Stress",
        // baseScore = 3 * 10 = 30, streak (days since) = 2, uniqueWindowDays = 1
        // habitScore = floor(30 * 1.005 * 0.99) = floor(29.8485)
        habitScore: Math.floor(30 * 1.005 * 0.99),
        mode: "do-less",
        streak: 2,
        targetScore: 100,
        windowEntries: 1,
      },
    ])
  })

  test("returns an empty array when no habits are configured", async () => {
    vi.mocked(resolveNotesConfig).mockResolvedValue({ ...BASE_CONFIG, habits: [] } as never)

    const { response, status, json } = makeResponse()
    await habitsHandler({} as never, response, vi.fn())

    expect(status).toHaveBeenCalledWith(200)
    expect(json).toHaveBeenCalledWith([])
  })

  test("returns 500 with config error message on AppConfigError", async () => {
    vi.mocked(resolveNotesConfig).mockRejectedValue(new AppConfigError("app.config.json is required"))

    const { response, status, json } = makeResponse()
    await habitsHandler({} as never, response, vi.fn())

    expect(status).toHaveBeenCalledWith(500)
    expect(json).toHaveBeenCalledWith({ error: "app.config.json is required" })
  })

  test("returns generic 500 on unexpected error", async () => {
    vi.mocked(resolveNotesConfig).mockResolvedValue({ ...BASE_CONFIG, habits: [HABIT_DO_MORE] } as never)
    vi.mocked(collectMarkdownFiles).mockRejectedValue(new Error("boom"))

    const { response, status, json } = makeResponse()
    await habitsHandler({} as never, response, vi.fn())

    expect(status).toHaveBeenCalledWith(500)
    expect(json).toHaveBeenCalledWith({ error: "Unable to load habits" })
  })
})
