import { ChakraProvider, defaultSystem } from "@chakra-ui/react"
import { fireEvent, render, screen } from "@testing-library/react"
import { beforeEach, describe, expect, test, vi } from "vitest"

import { ToggleReadButton } from "./ToggleReadButton"

const useToggleReadMock = vi.fn()
const mutateMock = vi.fn()

vi.mock("services", async (importOriginal) => {
  const actual = await importOriginal<typeof import("services")>()

  return {
    ...actual,
    useToggleRead: ({ noteId }: { noteId: string }) =>
      useToggleReadMock(noteId),
  }
})

describe("ToggleReadButton", () => {
  beforeEach(() => {
    mutateMock.mockReset()
    useToggleReadMock.mockReturnValue({
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

    const button = screen.getByRole("button", { name: "notes.markAsRead" })
    fireEvent.click(button)

    expect(mutateMock).toHaveBeenCalledTimes(1)
  })
})
