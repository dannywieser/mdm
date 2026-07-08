import { ChakraProvider, defaultSystem } from "@chakra-ui/react"
import { cleanup, render, screen } from "@testing-library/react"
import { afterEach, describe, expect, test, vi } from "vitest"

afterEach(cleanup)

import type { StatsHistoryResponse, StatsMetaResponse } from "services"

import { HomeStats } from "../HomeStats"

const useStatsMetaMock = vi.fn()
const useStatsHistoryMock = vi.fn()

vi.mock("services", async (importOriginal) => {
  const actual = await importOriginal<typeof import("services")>()

  return {
    ...actual,
    useStatsMeta: () => useStatsMetaMock(),
    useStatsHistory: () => useStatsHistoryMock(),
  }
})

vi.mock("../../../i18n", () => ({
  useI18n: () => ({ t: (key: string) => key }),
}))

const defaultData: StatsMetaResponse = {
  totalAttachments: { pdf: 2, png: 1234 },
  totalFolders: 8,
  totalNotes: 200,
  totalWords: 45213,
}

const defaultHistory: StatsHistoryResponse = [
  { date: "2026-05-01", entriesCreated: 3, entriesModified: 1, foldersTouched: 2 },
]

const renderComponent = (data = defaultData, history = defaultHistory) => {
  useStatsMetaMock.mockReturnValue({ data })
  useStatsHistoryMock.mockReturnValue({ data: history })
  render(
    <ChakraProvider value={defaultSystem}>
      <HomeStats />
    </ChakraProvider>,
  )
}

describe("HomeStats", () => {
  test("renders total notes, folders, and words", () => {
    renderComponent()

    expect(screen.getByText("200")).toBeTruthy()
    expect(screen.getByText("8")).toBeTruthy()
    expect(screen.getByText("45K")).toBeTruthy()
  })

  test("renders attachment breakdown by extension", () => {
    renderComponent()

    expect(screen.getByText("png")).toBeTruthy()
    expect(screen.getByText("1.2K")).toBeTruthy()
    expect(screen.getByText("pdf")).toBeTruthy()
    expect(screen.getByText("2")).toBeTruthy()
  })

  test("hides attachment breakdown section when there are no attachments", () => {
    renderComponent({ ...defaultData, totalAttachments: {} })

    expect(screen.queryByText("stats.attachments")).toBeNull()
  })
})
