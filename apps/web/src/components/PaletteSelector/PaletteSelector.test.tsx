import { ChakraProvider } from "@chakra-ui/react"
import { cleanup, render, screen } from "@testing-library/react"
import { MemoryRouter } from "react-router-dom"
import { afterEach, beforeEach, describe, expect, test, vi } from "vitest"

import { defaultColorPaletteSystem } from "../../theme/system"

import { PaletteSelector } from "./PaletteSelector"

const useColorPaletteMock = vi.fn()

vi.mock("../../context/ColorPalette/useColorPalette", () => ({
  useColorPalette: () => useColorPaletteMock(),
}))

vi.mock("../../i18n", () => ({
  useI18n: () => ({ t: (key: string) => key }),
}))

const renderComponent = () =>
  render(
    <ChakraProvider value={defaultColorPaletteSystem}>
      <MemoryRouter>
        <PaletteSelector />
      </MemoryRouter>
    </ChakraProvider>,
  )

describe("PaletteSelector", () => {
  afterEach(() => cleanup())

  beforeEach(() => {
    useColorPaletteMock.mockReturnValue({
      palette: "dracula",
    })
  })

  test("renders a trigger link to the colors page", () => {
    renderComponent()
    const trigger = screen.getByTestId("palette-selector-trigger")
    expect(trigger).toBeTruthy()
    expect(trigger.getAttribute("href")).toBe("/colors")
  })
})
