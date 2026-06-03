import { ChakraProvider, defaultSystem } from "@chakra-ui/react"
import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react"
import { afterEach, describe, expect, test, vi } from "vitest"

import {
  NotesReviewTableOfContentsMobileTrigger,
  NotesReviewTableOfContentsSidebar,
} from "./NotesReviewTableOfContents"

vi.mock("../../i18n", () => ({
  useI18n: () => ({ t: (key: string, values?: Record<string, string | number>) => {
    if (values) return `${key}:${JSON.stringify(values)}`
    return key
  }}),
}))

const notes = [
  { id: "1", title: "Note One", isRead: true },
  { id: "2", title: "Note Two", isRead: false },
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
