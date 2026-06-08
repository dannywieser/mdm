import { ChakraProvider, defaultSystem } from "@chakra-ui/react"
import { cleanup, render, screen } from "@testing-library/react"
import { afterEach, describe, expect, test, vi } from "vitest"

import { HeatDots } from "./HeatDots"

vi.mock("../../i18n", () => ({
  useI18n: () => ({ t: (key: string) => key }),
}))

afterEach(cleanup)

const renderHeatDots = (count: number) =>
  render(
    <ChakraProvider value={defaultSystem}>
      <HeatDots count={count} />
    </ChakraProvider>,
  )

describe("HeatDots", () => {
  test("renders one dot per point of heat", () => {
    renderHeatDots(3)

    const dots = screen.getByLabelText("habit.heatLevel")

    expect(dots.children).toHaveLength(3)
  })

  test("renders nothing when the count is zero", () => {
    renderHeatDots(0)

    expect(screen.queryByLabelText("habit.heatLevel")).toBeNull()
  })
})
