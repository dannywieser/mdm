import { ChakraProvider, defaultSystem } from "@chakra-ui/react"
import { cleanup, fireEvent, render, screen } from "@testing-library/react"
import { afterEach, describe, expect, test, vi } from "vitest"

import type { LinkedNote } from "./LinkedNotesList.types"
import { LinkedNotesList } from "./LinkedNotesList"

vi.mock("../MarkdownTree", () => ({
  MarkdownTree: () => null,
}))

const notes: LinkedNote[] = [
  { id: "1", title: "Linked One", content: { type: "root", children: [] } },
  { id: "2", title: "Linked Two", content: { type: "root", children: [] } },
]

afterEach(() => {
  cleanup()
})

const renderWith = (ui: React.ReactElement) =>
  render(<ChakraProvider value={defaultSystem}>{ui}</ChakraProvider>)

describe("LinkedNotesList", () => {
  test("renders nothing when notes list is empty", () => {
    const { container } = renderWith(<LinkedNotesList notes={[]} />)
    expect(container.firstChild).toBeNull()
  })

  test("renders the trigger with note count", () => {
    renderWith(<LinkedNotesList notes={notes} />)
    expect(screen.getByText("notes.linkedNotes (2)")).toBeTruthy()
  })

  test("expands to show linked note titles on trigger click", () => {
    renderWith(<LinkedNotesList notes={notes} />)
    fireEvent.click(screen.getByText("notes.linkedNotes (2)"))
    expect(screen.getByText("Linked One")).toBeTruthy()
    expect(screen.getByText("Linked Two")).toBeTruthy()
  })
})
