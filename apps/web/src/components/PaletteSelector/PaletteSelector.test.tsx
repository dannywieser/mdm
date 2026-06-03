import { ChakraProvider } from "@chakra-ui/react"
import { fireEvent, render, screen } from "@testing-library/react"
import { beforeEach, describe, expect, test, vi } from "vitest"

import { defaultColorPaletteSystem } from "../../theme/system"

import { PaletteSelector } from "./PaletteSelector"

const useColorPaletteMock = vi.fn()
const setPaletteMock = vi.fn()

vi.mock("../../context/ColorPalette/useColorPalette", () => ({
  useColorPalette: () => useColorPaletteMock(),
}))

describe("PaletteSelector", () => {
  beforeEach(() => {
    setPaletteMock.mockReset()
    useColorPaletteMock.mockReturnValue({
      palette: "dracula",
      setPalette: setPaletteMock,
    })
  })

  test("renders options and updates selection", () => {
    render(
      <ChakraProvider value={defaultColorPaletteSystem}>
        <PaletteSelector />
      </ChakraProvider>,
    )

    const select = screen.getByRole("combobox", { name: "Color palette" })

    expect(select).toBeTruthy()
    expect(screen.getByRole("option", { name: "Dracula" })).toBeTruthy()
    expect(screen.getByRole("option", { name: "Gruvbox" })).toBeTruthy()

    fireEvent.change(select, { target: { value: "nord" } })

    expect(setPaletteMock).toHaveBeenCalledWith("nord")
  })
})
