import { ChakraProvider, defaultSystem } from "@chakra-ui/react"
import { cleanup, render, screen } from "@testing-library/react"
import { afterEach, describe, expect, test, vi } from "vitest"

afterEach(cleanup)

import type { StatsMetaResponse } from "services"

import { HomeStats } from "../HomeStats"

const useStatsMetaMock = vi.fn()

vi.mock("services", async (importOriginal) => {
  const actual = await importOriginal<typeof import("services")>()

  return {
    ...actual,
    useStatsMeta: () => useStatsMetaMock(),
  }
})

vi.mock("../../../i18n", () => ({
  useI18n: () => ({ t: (key: string) => key }),
}))

const defaultData: StatsMetaResponse = {
  totalAttachments: { pdf: 2, png: 17 },
  totalFolders: 8,
  totalNotes: 200,
  totalWords: 45213,
}

const renderComponent = (data = defaultData) => {
  useStatsMetaMock.mockReturnValue({ data })
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
    expect(screen.getByText("45,213")).toBeTruthy()
  })

  test("renders attachment breakdown by extension", () => {
    renderComponent()

    expect(screen.getByText("png")).toBeTruthy()
    expect(screen.getByText("17")).toBeTruthy()
    expect(screen.getByText("pdf")).toBeTruthy()
    expect(screen.getByText("2")).toBeTruthy()
  })

  test("hides attachment breakdown section when there are no attachments", () => {
    renderComponent({ ...defaultData, totalAttachments: {} })

    expect(screen.queryByText("stats.attachments")).toBeNull()
  })
})
