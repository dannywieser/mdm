import { render } from "@testing-library/react"
import { describe, expect, test } from "vitest"

import { ColorPaletteProvider } from "../ColorPalette"
import { useColorPalette } from "../useColorPalette"

const Consumer = () => {
  const { palette } = useColorPalette()

  return <div>{palette}</div>
}

describe("useColorPalette", () => {
  test("throws when used outside provider", () => {
    expect(() => render(<Consumer />)).toThrow(
      "useColorPalette must be used within ColorPaletteProvider",
    )
  })

  test("returns context value inside provider", () => {
    const { getByText } = render(
      <ColorPaletteProvider>
        <Consumer />
      </ColorPaletteProvider>,
    )

    expect(getByText("dracula")).toBeTruthy()
  })
})
