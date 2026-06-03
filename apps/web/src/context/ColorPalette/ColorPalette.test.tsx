import { render, screen, waitFor } from "@testing-library/react"
import { beforeEach, describe, expect, test } from "vitest"

import { useColorPalette } from "./useColorPalette"
import { ColorPaletteProvider } from "./ColorPalette"

const paletteStorageKey = "mdm.colorPalette"

const Consumer = () => {
  const { palette, setPalette } = useColorPalette()

  return (
    <>
      <div>{palette}</div>
      <button type="button" onClick={() => setPalette("solarized")}>
        set-solarized
      </button>
    </>
  )
}

describe("ColorPaletteProvider", () => {
  beforeEach(() => {
    window.localStorage.clear()
  })

  test("loads palette from localStorage", () => {
    window.localStorage.setItem(paletteStorageKey, "nord")

    render(
      <ColorPaletteProvider>
        <Consumer />
      </ColorPaletteProvider>,
    )

    expect(screen.getByText("nord")).toBeTruthy()
  })

  test("persists changed palette to localStorage", async () => {
    window.localStorage.setItem(paletteStorageKey, "dracula")

    render(
      <ColorPaletteProvider>
        <Consumer />
      </ColorPaletteProvider>,
    )

    screen.getByRole("button", { name: "set-solarized" }).click()

    await waitFor(() => {
      expect(window.localStorage.getItem(paletteStorageKey)).toBe("solarized")
    })
  })
})
