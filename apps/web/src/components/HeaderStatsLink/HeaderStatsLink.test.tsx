import { ChakraProvider } from "@chakra-ui/react"
import { cleanup, render, screen } from "@testing-library/react"
import { MemoryRouter } from "react-router-dom"
import { afterEach, describe, expect, test, vi } from "vitest"

import { defaultColorPaletteSystem } from "../../theme/system"
import { HeaderStatsLink } from "./HeaderStatsLink"

vi.mock("../../i18n", () => ({
  useI18n: () => ({ t: (key: string) => key }),
}))

afterEach(() => {
  cleanup()
})

const renderComponent = () =>
  render(
    <ChakraProvider value={defaultColorPaletteSystem}>
      <MemoryRouter>
        <HeaderStatsLink />
      </MemoryRouter>
    </ChakraProvider>,
  )

describe("HeaderStatsLink", () => {
  test("renders a link to the stats page", () => {
    renderComponent()

    const link = screen.getByTestId("header-stats-link")
    expect(link).toBeTruthy()
    expect(link.getAttribute("href")).toBe("/stats")
  })

  test("has an accessible label", () => {
    renderComponent()

    expect(screen.getByRole("link", { name: "header.stats" })).toBeTruthy()
  })
})
