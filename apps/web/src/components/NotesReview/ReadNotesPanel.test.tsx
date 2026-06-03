import { ChakraProvider, defaultSystem } from "@chakra-ui/react"
import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react"
import { afterEach, describe, expect, test, vi } from "vitest"

import { ReadNotesMobileTrigger, ReadNotesSidebar } from "./ReadNotesPanel"

vi.mock("../../i18n", () => ({
  useI18n: () => ({ t: (key: string) => key }),
}))

const notes = [
  { id: "1", title: "Note One" },
  { id: "2", title: "Note Two" },
]

afterEach(() => {
  cleanup()
})

const renderWith = (ui: React.ReactElement) =>
  render(<ChakraProvider value={defaultSystem}>{ui}</ChakraProvider>)

describe("ReadNotesSidebar", () => {
  test("renders empty container when notes list is empty", () => {
    renderWith(<ReadNotesSidebar notes={[]} />)
    expect(screen.queryByText("review.read")).toBeNull()
  })

  test("renders the section heading and note titles", () => {
    renderWith(<ReadNotesSidebar notes={notes} />)
    expect(screen.getByText("review.read")).toBeTruthy()
    expect(screen.getByText("Note One")).toBeTruthy()
    expect(screen.getByText("Note Two")).toBeTruthy()
  })
})

describe("ReadNotesMobileTrigger", () => {
  test("renders nothing when notes list is empty", () => {
    const { container } = renderWith(<ReadNotesMobileTrigger notes={[]} />)
    expect(container.firstChild).toBeNull()
  })

  test("renders icon button with note count", () => {
    renderWith(<ReadNotesMobileTrigger notes={notes} />)
    expect(screen.getByRole("button", { name: "review.read" })).toBeTruthy()
    expect(screen.getByText("2")).toBeTruthy()
  })

  test("opens drawer with note titles on trigger click", async () => {
    renderWith(<ReadNotesMobileTrigger notes={notes} />)
    fireEvent.click(screen.getByRole("button", { name: "review.read" }))
    await waitFor(() => {
      expect(screen.getByText("Note One")).toBeTruthy()
      expect(screen.getByText("Note Two")).toBeTruthy()
    })
  })

  test("renders close button in drawer", async () => {
    renderWith(<ReadNotesMobileTrigger notes={notes} />)
    fireEvent.click(screen.getByRole("button", { name: "review.read" }))
    await waitFor(() => {
      expect(screen.getByRole("button", { name: "review.close" })).toBeTruthy()
    })
  })
})
