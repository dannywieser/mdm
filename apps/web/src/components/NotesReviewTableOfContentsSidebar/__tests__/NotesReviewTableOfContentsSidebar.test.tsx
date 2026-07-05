import { ChakraProvider, defaultSystem } from "@chakra-ui/react"
import { cleanup, render, screen } from "@testing-library/react"
import { afterEach, describe, expect, test, vi } from "vitest"

import { NotesReviewTableOfContentsSidebar } from "../NotesReviewTableOfContentsSidebar"

vi.mock("../../../i18n", () => ({
  useI18n: () => ({ t: (key: string, values?: Record<string, string | number>) => {
    if (values) return `${key}:${JSON.stringify(values)}`
    return key
  }}),
}))

const notes = [
  { id: "1", title: "Note One", isRead: true, obsidianUrl: "obsidian://open?vault=test&file=note-one" },
  { id: "2", title: "Note Two", isRead: false, obsidianUrl: "obsidian://open?vault=test&file=note-two" },
]

afterEach(() => {
  cleanup()
})

const renderWith = (ui: React.ReactElement) =>
  render(<ChakraProvider value={defaultSystem}>{ui}</ChakraProvider>)

describe("NotesReviewTableOfContentsSidebar", () => {
  test("renders empty container when notes list is empty", () => {
    renderWith(<NotesReviewTableOfContentsSidebar notes={[]} currentIndex={0} />)
    expect(screen.queryByText(/review\.forReview/)).toBeNull()
  })

  test("renders the header with note count", () => {
    renderWith(<NotesReviewTableOfContentsSidebar notes={notes} currentIndex={0} />)
    expect(screen.getByText('review.forReview:{"count":2}')).toBeTruthy()
  })

  test("renders all note titles", () => {
    renderWith(<NotesReviewTableOfContentsSidebar notes={notes} currentIndex={0} />)
    expect(screen.getByText("Note One")).toBeTruthy()
    expect(screen.getByText("Note Two")).toBeTruthy()
  })
})
