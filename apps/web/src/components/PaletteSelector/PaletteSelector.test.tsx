import { ChakraProvider } from "@chakra-ui/react"
import { cleanup, fireEvent, render, screen } from "@testing-library/react"
import { afterEach, beforeEach, describe, expect, test, vi } from "vitest"

import { defaultColorPaletteSystem } from "../../theme/system"

import { PaletteSelector } from "./PaletteSelector"

const useColorPaletteMock = vi.fn()
const setPaletteMock = vi.fn()

vi.mock("../../context/ColorPalette/useColorPalette", () => ({
  useColorPalette: () => useColorPaletteMock(),
}))

const renderComponent = () =>
  render(
    <ChakraProvider value={defaultColorPaletteSystem}>
      <PaletteSelector />
    </ChakraProvider>,
  )

describe("PaletteSelector", () => {
  afterEach(() => cleanup())

  beforeEach(() => {
    setPaletteMock.mockReset()
    useColorPaletteMock.mockReturnValue({
      palette: "dracula",
      setPalette: setPaletteMock,
    })
  })

  test("renders a trigger swatch button", () => {
    renderComponent()
    expect(screen.getByTestId("palette-selector-trigger")).toBeTruthy()
  })

  test("renders all palette options in the DOM", () => {
    renderComponent()
    expect(screen.getByTestId("palette-option-dracula")).toBeTruthy()
    expect(screen.getByTestId("palette-option-nord")).toBeTruthy()
    expect(screen.getByTestId("palette-option-gruvbox")).toBeTruthy()
    expect(screen.getByTestId("palette-option-catppuccin")).toBeTruthy()
    expect(screen.getByTestId("palette-option-solarized")).toBeTruthy()
    expect(screen.getByTestId("palette-option-githubHighContrast")).toBeTruthy()
  })

  test("labels palette options with i18n keys", () => {
    renderComponent()
    const nordOption = screen.getByTestId("palette-option-nord")
    expect(nordOption.getAttribute("aria-label")).toBe("palette.nord")
  })

  test("calls setPalette when a swatch option is clicked", () => {
    renderComponent()
    fireEvent.click(screen.getByTestId("palette-option-nord"))
    expect(setPaletteMock).toHaveBeenCalledWith("nord")
  })

  test("marks the active palette swatch as pressed", () => {
    renderComponent()
    expect(
      screen.getByTestId("palette-option-dracula").getAttribute("aria-pressed"),
    ).toBe("true")
    expect(
      screen.getByTestId("palette-option-nord").getAttribute("aria-pressed"),
    ).toBe("false")
  })
})
