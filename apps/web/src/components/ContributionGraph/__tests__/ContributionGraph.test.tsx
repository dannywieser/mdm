import { ChakraProvider, defaultSystem } from "@chakra-ui/react"
import { cleanup, render, screen } from "@testing-library/react"
import { afterEach, describe, expect, test, vi } from "vitest"

afterEach(cleanup)

import type { StatsHistoryResponse } from "services"

import { ContributionGraph } from "../ContributionGraph"

const useStatsHistoryMock = vi.fn()

vi.mock("services", async (importOriginal) => {
  const actual = await importOriginal<typeof import("services")>()

  return {
    ...actual,
    useStatsHistory: () => useStatsHistoryMock(),
  }
})

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

const renderComponent = (data: StatsHistoryResponse = defaultData) => {
  useStatsHistoryMock.mockReturnValue({ data })
  render(
    <ChakraProvider value={defaultSystem}>
      <ContributionGraph />
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
      '[aria-label*="stats.activityDetails"][aria-label*="\\"created\\":3"][aria-label*="\\"modified\\":1"][aria-label*="\\"folders\\":2"]',
    )).toBeTruthy()
    expect(document.querySelector(
      '[aria-label*="stats.activityDetails"][aria-label*="\\"created\\":0"][aria-label*="\\"modified\\":2"][aria-label*="\\"folders\\":1"]',
    )).toBeTruthy()
  })

  test("renders an on-hover card with the date and created/modified/folders details for each day", () => {
    renderComponent()

    expect(screen.getByText("May 1, 2026")).toBeTruthy()
    expect(screen.getByText('stats.activityDetails {"created":3,"folders":2,"modified":1}')).toBeTruthy()
    expect(screen.getByText("May 2, 2026")).toBeTruthy()
    expect(screen.getByText('stats.activityDetails {"created":0,"folders":1,"modified":2}')).toBeTruthy()
  })

  test("renders nothing when there is no history", () => {
    useStatsHistoryMock.mockReturnValue({ data: [] })
    const { container } = render(
      <ChakraProvider value={defaultSystem}>
        <ContributionGraph />
      </ChakraProvider>,
    )

    expect(container.firstChild).toBeNull()
  })
})
