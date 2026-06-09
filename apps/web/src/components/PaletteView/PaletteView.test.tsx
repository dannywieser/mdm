import { ChakraProvider } from "@chakra-ui/react"
import { cleanup, fireEvent, render, screen } from "@testing-library/react"
import { afterEach, beforeEach, describe, expect, test, vi } from "vitest"

import { defaultColorPaletteSystem } from "../../theme/system"

import { PaletteView } from "./PaletteView"

const useColorPaletteMock = vi.fn()
const setPaletteMock = vi.fn()

vi.mock("../../context/ColorPalette/useColorPalette", () => ({
  useColorPalette: () => useColorPaletteMock(),
}))

vi.mock("../../i18n", () => ({
  useI18n: () => ({ t: (key: string) => key }),
}))

vi.mock("../PalettePreview/PalettePreview", () => ({
  PalettePreview: () => <div />,
}))

const renderComponent = () =>
  render(
    <ChakraProvider value={defaultColorPaletteSystem}>
      <PaletteView />
    </ChakraProvider>,
  )

describe("PaletteView", () => {
  afterEach(() => cleanup())

  beforeEach(() => {
    setPaletteMock.mockReset()
    useColorPaletteMock.mockReturnValue({
      palette: "dracula",
      setPalette: setPaletteMock,
    })
  })

  test("renders all palette options", () => {
    renderComponent()
    expect(screen.getByTestId("palette-option-dracula")).toBeTruthy()
    expect(screen.getByTestId("palette-option-nord")).toBeTruthy()
    expect(screen.getByTestId("palette-option-gruvbox")).toBeTruthy()
    expect(screen.getByTestId("palette-option-catppuccin")).toBeTruthy()
    expect(screen.getByTestId("palette-option-solarized")).toBeTruthy()
    expect(screen.getByTestId("palette-option-highContrast")).toBeTruthy()
    expect(screen.getByTestId("palette-option-ocean")).toBeTruthy()
  })

  test("labels palette options with i18n keys", () => {
    renderComponent()
    const nordOption = screen.getByTestId("palette-option-nord")
    expect(nordOption.getAttribute("aria-label")).toBe("palette.nord")
  })

  test("calls setPalette when a palette option is clicked", () => {
    renderComponent()
    fireEvent.click(screen.getByTestId("palette-option-nord"))
    expect(setPaletteMock).toHaveBeenCalledWith("nord")
  })

  test("marks the active palette as pressed", () => {
    renderComponent()
    expect(
      screen.getByTestId("palette-option-dracula").getAttribute("aria-pressed"),
    ).toBe("true")
    expect(
      screen.getByTestId("palette-option-nord").getAttribute("aria-pressed"),
    ).toBe("false")
  })
})
