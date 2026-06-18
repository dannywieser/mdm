import { ChakraProvider, defaultSystem } from "@chakra-ui/react"
import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react"
import { afterEach, describe, expect, test, vi } from "vitest"

import { NotesReviewTableOfContentsMobileTrigger } from "./NotesReviewTableOfContentsMobileTrigger"

vi.mock("../../i18n", () => ({
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

describe("NotesReviewTableOfContentsMobileTrigger", () => {
  test("renders nothing when notes list is empty", () => {
    const { container } = renderWith(
      <NotesReviewTableOfContentsMobileTrigger notes={[]} currentIndex={0} />,
    )
    expect(container.firstChild).toBeNull()
  })

  test("renders icon button with current/total text", () => {
    renderWith(
      <NotesReviewTableOfContentsMobileTrigger notes={notes} currentIndex={1} />,
    )
    expect(screen.getByText("2/2")).toBeTruthy()
  })

  test("opens drawer with all note titles on trigger click", async () => {
    renderWith(
      <NotesReviewTableOfContentsMobileTrigger notes={notes} currentIndex={0} />,
    )
    fireEvent.click(screen.getByRole("button", { name: /review\.forReview/ }))
    await waitFor(() => {
      expect(screen.getByText("Note One")).toBeTruthy()
      expect(screen.getByText("Note Two")).toBeTruthy()
    })
  })

  test("renders close button in drawer", async () => {
    renderWith(
      <NotesReviewTableOfContentsMobileTrigger notes={notes} currentIndex={0} />,
    )
    fireEvent.click(screen.getByRole("button", { name: /review\.forReview/ }))
    await waitFor(() => {
      expect(screen.getByRole("button", { name: "review.close" })).toBeTruthy()
    })
  })
})
