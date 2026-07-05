import { cleanup, render, screen, waitFor } from "@testing-library/react"
import { afterEach, beforeEach, describe, expect, test } from "vitest"

import { useColorPalette } from "../useColorPalette"
import { ColorPaletteProvider, colorPaletteStorageKey } from "../ColorPalette"

const Consumer = () => {
  const { palette, setPalette } = useColorPalette()

  return (
    <>
      <div>{palette}</div>
      <button type="button" onClick={() => { setPalette("solarized"); }}>
        set-solarized
      </button>
    </>
  )
}

describe("ColorPaletteProvider", () => {
  afterEach(() => {
    cleanup()
  })

  beforeEach(() => {
    window.localStorage.clear()
  })

  test("loads palette from localStorage", () => {
    window.localStorage.setItem(colorPaletteStorageKey, "nord")

    render(
      <ColorPaletteProvider>
        <Consumer />
      </ColorPaletteProvider>,
    )

    expect(screen.getByText("nord")).toBeTruthy()
  })

  test("persists changed palette to localStorage", async () => {
    window.localStorage.setItem(colorPaletteStorageKey, "dracula")

    render(
      <ColorPaletteProvider>
        <Consumer />
      </ColorPaletteProvider>,
    )

    screen.getByRole("button", { name: "set-solarized" }).click()

    await waitFor(() => {
      expect(window.localStorage.getItem(colorPaletteStorageKey)).toBe(
        "solarized",
      )
    })
  })
})
