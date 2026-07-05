import { afterEach, beforeEach, describe, expect, test } from "vitest"

import { configureDemoMode, resetDemoMode } from "./demoMode"
import {
  buildDemoHabitsUrl,
  buildDemoHabitUrl,
  buildDemoImageUrl,
  buildDemoNotesUrl,
  buildDemoStatsUrl,
  buildDemoViewsUrl,
} from "./demoUrls"

beforeEach(() => {
  configureDemoMode({ dataBasePath: "/demo-data" })
})

afterEach(() => {
  resetDemoMode()
})

describe("buildDemoNotesUrl", () => {
  test("builds the per-view notes file URL", () => {
    expect(buildDemoNotesUrl("books")).toBe("/demo-data/notes.books.json")
  })

  test("builds the slim variant when content is excluded", () => {
    expect(buildDemoNotesUrl("books", false)).toBe("/demo-data/notes.books.slim.json")
  })

  test("builds the unfiltered notes file URL without a view", () => {
    expect(buildDemoNotesUrl()).toBe("/demo-data/notes.json")
  })
})

describe("simple demo endpoints", () => {
  test("views, stats, and habits point at their static files", () => {
    expect(buildDemoViewsUrl()).toBe("/demo-data/views.json")
    expect(buildDemoStatsUrl()).toBe("/demo-data/stats.json")
    expect(buildDemoHabitsUrl()).toBe("/demo-data/habits.json")
    expect(buildDemoHabitUrl("screen-time")).toBe("/demo-data/habit.screen-time.json")
  })
})

describe("buildDemoImageUrl", () => {
  test("maps vault-relative paths under the images directory", () => {
    expect(buildDemoImageUrl("attachments/covers/books/dune.svg")).toBe(
      "/demo-data/images/attachments/covers/books/dune.svg",
    )
  })

  test("encodes path segments with spaces", () => {
    expect(buildDemoImageUrl("attachments/my cover.svg")).toBe(
      "/demo-data/images/attachments/my%20cover.svg",
    )
  })
})
