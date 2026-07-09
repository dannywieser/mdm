import { ChakraProvider, defaultSystem } from "@chakra-ui/react"
import { cleanup, render, screen } from "@testing-library/react"
import { afterEach, describe, expect, test, vi } from "vitest"

afterEach(cleanup)

import type { StatsHistoryResponse } from "services"

import { ContributionGraph } from "../ContributionGraph"

vi.mock("../../../i18n", () => ({
  useI18n: () => ({
    t: (key: string, values?: Record<string, string | number>) =>
      values ? `${key} ${JSON.stringify(values)}` : key,
  }),
}))

const defaultData: StatsHistoryResponse = [
  { date: "2026-05-01", entriesCreated: 3, entriesModified: 1, foldersTouched: 2 },
  { date: "2026-05-02", entriesCreated: 0, entriesModified: 2, foldersTouched: 1 },
]

const renderComponent = (history: StatsHistoryResponse = defaultData) => {
  render(
    <ChakraProvider value={defaultSystem}>
      <ContributionGraph history={history} />
    </ChakraProvider>,
  )
}

describe("ContributionGraph", () => {
  test("renders the activity label, year heading, and legend", () => {
    renderComponent()

    expect(screen.getByText("stats.activityGraph")).toBeTruthy()
    expect(screen.getByText("2026")).toBeTruthy()
    expect(screen.getByText("stats.activityLess")).toBeTruthy()
    expect(screen.getByText("stats.activityMore")).toBeTruthy()
  })

  test("labels each day square with its created/modified/folders details", () => {
    renderComponent()

    expect(document.querySelector(
      '[aria-label*="stats.activityCreated"][aria-label*="\\"created\\":3"][aria-label*="stats.activityModified"][aria-label*="\\"modified\\":1"][aria-label*="stats.activityFoldersTouched"][aria-label*="\\"folders\\":2"]',
    )).toBeTruthy()
    expect(document.querySelector(
      '[aria-label*="stats.activityCreated"][aria-label*="\\"created\\":0"][aria-label*="stats.activityModified"][aria-label*="\\"modified\\":2"][aria-label*="stats.activityFoldersTouched"][aria-label*="\\"folders\\":1"]',
    )).toBeTruthy()
  })

  test("renders an on-hover card with the date and each stat on its own line", () => {
    renderComponent()

    expect(screen.getByText("May 1, 2026")).toBeTruthy()
    expect(screen.getByText('stats.activityCreated {"created":3}')).toBeTruthy()
    expect(screen.getByText('stats.activityModified {"modified":1}')).toBeTruthy()
    expect(screen.getByText('stats.activityFoldersTouched {"folders":2}')).toBeTruthy()
    expect(screen.getByText("May 2, 2026")).toBeTruthy()
    expect(screen.getByText('stats.activityCreated {"created":0}')).toBeTruthy()
    expect(screen.getByText('stats.activityModified {"modified":2}')).toBeTruthy()
    expect(screen.getByText('stats.activityFoldersTouched {"folders":1}')).toBeTruthy()
  })

  test("renders nothing when there is no history", () => {
    const { container } = render(
      <ChakraProvider value={defaultSystem}>
        <ContributionGraph history={[]} />
      </ChakraProvider>,
    )

    expect(container.firstChild).toBeNull()
  })

  test("flags an outlier day's tooltip and shows the outlier legend", () => {
    const history: StatsHistoryResponse = [
      { date: "2026-05-01", entriesCreated: 0, entriesModified: 5, foldersTouched: 1 },
      { date: "2026-05-02", entriesCreated: 0, entriesModified: 10, foldersTouched: 1 },
      { date: "2026-05-03", entriesCreated: 0, entriesModified: 15, foldersTouched: 1 },
      { date: "2026-05-04", entriesCreated: 0, entriesModified: 20, foldersTouched: 1 },
      { date: "2026-05-05", entriesCreated: 0, entriesModified: 25, foldersTouched: 1 },
      { date: "2026-05-06", entriesCreated: 0, entriesModified: 900, foldersTouched: 1 },
    ]
    renderComponent(history)

    expect(screen.getAllByText("stats.activityOutlier")).toHaveLength(2)
    expect(document.querySelector(
      '[aria-label*="May 6, 2026"][aria-label*="stats.activityOutlier"]',
    )).toBeTruthy()
    expect(document.querySelector(
      '[aria-label*="May 1, 2026"][aria-label*="stats.activityOutlier"]',
    )).toBeNull()
  })

  test("does not show the outlier legend when every day is within a typical range", () => {
    renderComponent()

    expect(screen.queryByText("stats.activityOutlier")).toBeNull()
  })

  test("shades a mild outlier lighter than an extreme one instead of using one flat outlier color", () => {
    const history: StatsHistoryResponse = [
      ...Array.from({ length: 10 }, (_, index) => ({
        date: `2026-04-${String(index + 1).padStart(2, "0")}`,
        entriesCreated: 1,
        entriesModified: 0,
        foldersTouched: 1,
      })),
      { date: "2026-04-11", entriesCreated: 50, entriesModified: 0, foldersTouched: 1 },
      { date: "2026-04-12", entriesCreated: 900, entriesModified: 0, foldersTouched: 1 },
    ]
    renderComponent(history)

    const mildOutlier = document.querySelector<HTMLElement>('[aria-label*="Apr 11, 2026"]')!
    const extremeOutlier = document.querySelector<HTMLElement>('[aria-label*="Apr 12, 2026"]')!

    const mildOpacity = Number(getComputedStyle(mildOutlier).opacity)
    const extremeOpacity = Number(getComputedStyle(extremeOutlier).opacity)

    expect(mildOpacity).toBeLessThan(extremeOpacity)
    expect(extremeOpacity).toBe(1)
  })
})
