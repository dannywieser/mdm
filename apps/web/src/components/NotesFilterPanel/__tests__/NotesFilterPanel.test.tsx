import { ChakraProvider, defaultSystem } from "@chakra-ui/react"
import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react"
import { MemoryRouter } from "react-router-dom"
import { afterEach, describe, expect, test, vi } from "vitest"

import { NotesFilterPanel } from "../NotesFilterPanel"
import type { NotesFilterPanelProps } from "../NotesFilterPanel.types"

afterEach(cleanup)

const renderPanel = ({
  frontmatterFacets = [],
  isOpen = true,
  onClose = vi.fn(),
  yearOptions = [],
}: Partial<NotesFilterPanelProps> = {}) =>
  render(
    <ChakraProvider value={defaultSystem}>
      <MemoryRouter initialEntries={["/notes/books"]}>
        <NotesFilterPanel
          frontmatterFacets={frontmatterFacets}
          isOpen={isOpen}
          onClose={onClose}
          yearOptions={yearOptions}
        />
      </MemoryRouter>
    </ChakraProvider>,
  )

describe("NotesFilterPanel", () => {
  test("renders nothing when closed", () => {
    renderPanel({ isOpen: false })

    expect(screen.queryByText("gallery.filters")).toBeNull()
  })

  test("renders the search input and title when open", async () => {
    renderPanel({ isOpen: true })

    await waitFor(() => {
      expect(screen.getByText("gallery.filters")).toBeTruthy()
      expect(screen.getByRole("textbox", { name: "header.searchNotes" })).toBeTruthy()
    })
  })

  test("renders a facet group per year option and frontmatter facet", async () => {
    renderPanel({
      isOpen: true,
      yearOptions: [2024, 2023],
      frontmatterFacets: [{ key: "status", values: ["done", "active"] }],
    })

    await waitFor(() => {
      expect(screen.getByRole("button", { name: "2024" })).toBeTruthy()
      expect(screen.getByRole("button", { name: "2023" })).toBeTruthy()
      expect(screen.getByRole("button", { name: "done" })).toBeTruthy()
      expect(screen.getByRole("button", { name: "active" })).toBeTruthy()
      expect(screen.getByText("status")).toBeTruthy()
    })
  })

  test("calls onClose when the close button is clicked", async () => {
    const onClose = vi.fn()
    renderPanel({ isOpen: true, onClose })

    await waitFor(() => {
      expect(screen.getByRole("button", { name: "gallery.closeFilters" })).toBeTruthy()
    })

    fireEvent.click(screen.getByRole("button", { name: "gallery.closeFilters" }))

    await waitFor(() => {
      expect(onClose).toHaveBeenCalled()
    })
  })
})
