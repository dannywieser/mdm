import { ChakraProvider, defaultSystem } from "@chakra-ui/react"
import { cleanup, render, screen } from "@testing-library/react"
import { afterEach, describe, expect, test, vi } from "vitest"

import { HeatDots } from "./HeatDots"

vi.mock("../../i18n", () => ({
  useI18n: () => ({ t: (key: string) => key }),
}))

const splitDotsIntoRowsMock = vi.fn()

vi.mock("./HeatDots.util", () => ({
  splitDotsIntoRows: (...args: unknown[]) => splitDotsIntoRowsMock(...args),
}))

afterEach(cleanup)

const renderHeatDots = (count: number) =>
  render(
    <ChakraProvider value={defaultSystem}>
      <HeatDots count={count} />
    </ChakraProvider>,
  )

describe("HeatDots", () => {
  test("renders nothing when the count is zero", () => {
    renderHeatDots(0)

    expect(screen.queryByLabelText("habit.heatLevel")).toBeNull()
  })

  test("renders a single row of dots when the util returns one row", () => {
    splitDotsIntoRowsMock.mockReturnValue([3])
    renderHeatDots(3)

    const container = screen.getByLabelText("habit.heatLevel")
    expect(container.children).toHaveLength(1)
    expect(screen.getAllByTestId("heat-dot")).toHaveLength(3)
  })

  test("renders multiple rows when the util splits the count across rows", () => {
    splitDotsIntoRowsMock.mockReturnValue([5, 1])
    renderHeatDots(6)

    const container = screen.getByLabelText("habit.heatLevel")
    expect(container.children).toHaveLength(2)
    expect(screen.getAllByTestId("heat-dot")).toHaveLength(6)
  })
})
