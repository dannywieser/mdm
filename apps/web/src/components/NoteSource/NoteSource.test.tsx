import { ChakraProvider, defaultSystem } from "@chakra-ui/react"
import { render, screen } from "@testing-library/react"
import { MemoryRouter, Route, Routes } from "react-router-dom"
import { describe, expect, test, vi } from "vitest"

import { NoteSource } from "./NoteSource"

const useNoteSourceQueryMock = vi.hoisted(() => vi.fn())

vi.mock("services", async (importOriginal) => {
  const actual = await importOriginal<typeof import("services")>()

  return {
    ...actual,
    useNoteSourceQuery: useNoteSourceQueryMock,
  }
})

vi.mock("../../i18n", () => ({
  useI18n: () => ({ t: (key: string) => key }),
}))

const renderAt = (noteId: string) =>
  render(
    <ChakraProvider value={defaultSystem}>
      <MemoryRouter initialEntries={[`/source/${noteId}`]}>
        <Routes>
          <Route path="/source/:noteId" element={<NoteSource />} />
        </Routes>
      </MemoryRouter>
    </ChakraProvider>,
  )

describe("NoteSource", () => {
  test("shows the demo notice alert and the note's markdown source", () => {
    useNoteSourceQueryMock.mockReturnValue({
      data: "---\ncreated: 2024-01-01\n---\n\nBody text.",
    })

    renderAt("note-1")

    expect(screen.getByText("source.demoNotice")).toBeTruthy()
    expect(screen.getByText(/created: 2024-01-01/)).toBeTruthy()
    expect(screen.getByText(/Body text\./)).toBeTruthy()
  })

  test("requests the source for the note id in the route", () => {
    useNoteSourceQueryMock.mockReturnValue({ data: "" })

    renderAt("abc-123")

    expect(useNoteSourceQueryMock).toHaveBeenCalledWith({ noteId: "abc-123" })
  })
})
