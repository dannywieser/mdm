import { ChakraProvider, defaultSystem } from "@chakra-ui/react"
import { cleanup, render, screen } from "@testing-library/react"
import { afterEach, describe, expect, test, vi } from "vitest"

afterEach(cleanup)

import { HomeStats } from "./HomeStats"
import {
  formatChangePercent,
  formatDate,
  formatMonthLabel,
  getChangeColor,
  getMonthTicks,
} from "./HomeStats.util"

const useStatsQueryMock = vi.fn()

vi.mock("../../hooks/useStatsQuery/useStatsQuery", () => ({
  useStatsQuery: () => useStatsQueryMock(),
}))

const defaultShow = {
  folderBreakdown: true,
  modifiedToday: true,
  notesCreated: true,
  notesPerDay: true,
  totalAttachments: true,
  totalFolders: true,
  totalNotes: true,
  trends: true,
}

const defaultData = {
  folderBreakdown: [
    { count: 17, folder: "projects" },
    { count: 6, folder: "archive" },
  ],
  homeStats: { show: defaultShow },
  modifiedToday: 3,
  notesCreated: { last30Days: 11, last365Days: 80, last90Days: 45 },
  notesPerDay: [{ count: 2, date: "2026-06-01" }],
  totalAttachments: 50,
  totalFolders: 8,
  totalNotes: 200,
  trends: { changePercent: 22, notesLast30Days: 11, notesPrevious30Days: 9 },
  views: [],
}

const renderComponent = (data = defaultData) => {
  useStatsQueryMock.mockReturnValue({ data })
  render(
    <ChakraProvider value={defaultSystem}>
      <HomeStats />
    </ChakraProvider>,
  )
}

describe("HomeStats", () => {
  test("renders total notes, folders, and attachments", () => {
    renderComponent()

    expect(screen.getByText("200")).toBeTruthy()
    expect(screen.getByText("8")).toBeTruthy()
    expect(screen.getByText("50")).toBeTruthy()
  })

  test("renders notesCreated counts", () => {
    renderComponent()

    expect(screen.getByText("11")).toBeTruthy()
    expect(screen.getByText("45")).toBeTruthy()
    expect(screen.getByText("80")).toBeTruthy()
  })

  test("renders trend with positive change", () => {
    renderComponent()

    expect(screen.getByText("+22%")).toBeTruthy()
  })

  test("hides totalNotes when show.totalNotes is false", () => {
    renderComponent({
      ...defaultData,
      homeStats: {
        show: { ...defaultShow, totalNotes: false },
      },
    })

    expect(screen.queryByText("Total notes")).toBeNull()
  })

  test("hides modifiedToday when show.modifiedToday is false", () => {
    renderComponent({
      ...defaultData,
      homeStats: {
        show: { ...defaultShow, modifiedToday: false },
      },
    })

    expect(screen.queryByText("Modified today:")).toBeNull()
  })

  test("hides folderBreakdown when show.folderBreakdown is false", () => {
    renderComponent({
      ...defaultData,
      homeStats: {
        show: { ...defaultShow, folderBreakdown: false },
      },
    })

    expect(screen.queryByText("projects")).toBeNull()
  })
})

describe("HomeStats util", () => {
  describe("formatChangePercent", () => {
    test("adds plus sign for positive values", () => {
      expect(formatChangePercent(25)).toBe("+25%")
    })

    test("no plus sign for negative values", () => {
      expect(formatChangePercent(-10)).toBe("-10%")
    })

    test("no plus sign for zero", () => {
      expect(formatChangePercent(0)).toBe("0%")
    })
  })

  describe("formatDate", () => {
    test("formats a YYYY-MM-DD string to short month and day", () => {
      expect(formatDate("2026-06-01")).toMatch(/Jun\s*1/)
    })
  })

  describe("formatMonthLabel", () => {
    test("formats a YYYY-MM-DD string to abbreviated month name", () => {
      expect(formatMonthLabel("2026-06-01")).toBe("Jun")
    })
  })

  describe("getChangeColor", () => {
    test("returns green for positive change", () => {
      expect(getChangeColor(10)).toBe("green.500")
    })

    test("returns red for negative change", () => {
      expect(getChangeColor(-5)).toBe("red.500")
    })

    test("returns muted for zero change", () => {
      expect(getChangeColor(0)).toBe("app.textMuted")
    })
  })

  describe("getMonthTicks", () => {
    test("returns dates that fall on the first of the month", () => {
      const data = [
        { count: 0, date: "2026-05-30" },
        { count: 0, date: "2026-05-31" },
        { count: 2, date: "2026-06-01" },
        { count: 1, date: "2026-06-02" },
        { count: 0, date: "2026-07-01" },
      ]
      expect(getMonthTicks(data)).toEqual(["2026-06-01", "2026-07-01"])
    })

    test("returns an empty array when no dates fall on the first", () => {
      const data = [
        { count: 0, date: "2026-06-15" },
        { count: 1, date: "2026-06-16" },
      ]
      expect(getMonthTicks(data)).toEqual([])
    })
  })
})
