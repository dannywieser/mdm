import { ChakraProvider, defaultSystem } from "@chakra-ui/react"
import { cleanup, render, screen } from "@testing-library/react"
import { MemoryRouter } from "react-router-dom"
import { configureDemoMode, resetDemoMode } from "services"
import { afterEach, describe, expect, test, vi } from "vitest"

import { NotesReviewComplete } from "../NotesReviewComplete"

vi.mock("../../../i18n", () => ({
  useI18n: () => ({ t: (key: string) => key }),
}))

const reviewedNotes = [
  { id: "1", title: "Note One", obsidianUrl: "obsidian://open?vault=test&file=note-one" },
]

afterEach(() => {
  cleanup()
  resetDemoMode()
})

const renderWith = (ui: React.ReactElement) =>
  render(
    <ChakraProvider value={defaultSystem}>
      <MemoryRouter>{ui}</MemoryRouter>
    </ChakraProvider>,
  )

describe("NotesReviewComplete", () => {
  test("links a reviewed note to its obsidianUrl outside of demo mode", () => {
    renderWith(<NotesReviewComplete isLoading={false} reviewedNotes={reviewedNotes} />)

    expect(screen.getByRole("link", { name: "Note One" }).getAttribute("href")).toBe(
      reviewedNotes[0].obsidianUrl,
    )
  })

  test("links a reviewed note to the in-app note source route in demo mode", () => {
    configureDemoMode({ dataBasePath: "/demo-data" })

    renderWith(<NotesReviewComplete isLoading={false} reviewedNotes={reviewedNotes} />)

    expect(screen.getByRole("link", { name: "Note One" }).getAttribute("href")).toBe("/source/1")
  })
})
