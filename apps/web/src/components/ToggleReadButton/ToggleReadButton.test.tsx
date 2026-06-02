import { ChakraProvider, defaultSystem } from "@chakra-ui/react"
import { fireEvent, render, screen } from "@testing-library/react"
import { beforeEach, describe, expect, test, vi } from "vitest"

import { ToggleReadButton } from "./ToggleReadButton"

const useToggleNoteReadMock = vi.fn()
const mutateMock = vi.fn()

vi.mock("../../hooks/useToggleNoteRead/useToggleNoteRead", () => ({
  useToggleNoteRead: ({ noteId }: { noteId: string }) =>
    useToggleNoteReadMock(noteId),
}))

describe("ToggleReadButton", () => {
  beforeEach(() => {
    mutateMock.mockReset()
    useToggleNoteReadMock.mockReturnValue({
      isPending: false,
      mutate: mutateMock,
    })
  })

  test("renders read label when note is unread and toggles on click", () => {
    render(
      <ChakraProvider value={defaultSystem}>
        <ToggleReadButton isRead={false} noteId="note-1" />
      </ChakraProvider>,
    )

    const button = screen.getByRole("button", { name: "mark as read" })
    fireEvent.click(button)

    expect(mutateMock).toHaveBeenCalledTimes(1)
  })
})
