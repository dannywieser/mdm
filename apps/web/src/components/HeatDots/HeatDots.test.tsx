import { ChakraProvider, defaultSystem } from "@chakra-ui/react"
import { cleanup, render, screen } from "@testing-library/react"
import { afterEach, describe, expect, test, vi } from "vitest"

import { HeatDots } from "./HeatDots"
import { splitDotsIntoRows } from "./HeatDots.util"

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

    expect(screen.getAllByTestId("heat-dot")).toHaveLength(3)
  })

  test("renders nothing when the count is zero", () => {
    renderHeatDots(0)

    expect(screen.queryByLabelText("habit.heatLevel")).toBeNull()
  })

  test("renders a single row when count is 5 or fewer", () => {
    renderHeatDots(5)

    const container = screen.getByLabelText("habit.heatLevel")
    expect(container.children).toHaveLength(1)
    expect(screen.getAllByTestId("heat-dot")).toHaveLength(5)
  })

  test("splits into multiple rows of 5 when count exceeds 5", () => {
    renderHeatDots(6)

    const container = screen.getByLabelText("habit.heatLevel")
    expect(container.children).toHaveLength(2)
    expect(screen.getAllByTestId("heat-dot")).toHaveLength(6)
  })

  test("fills each full row with 5 dots and puts the remainder in the last row", () => {
    renderHeatDots(11)

    const container = screen.getByLabelText("habit.heatLevel")
    expect(container.children).toHaveLength(3)
    expect(screen.getAllByTestId("heat-dot")).toHaveLength(11)
  })
})

describe("splitDotsIntoRows", () => {
  test("returns a single row for counts up to 5", () => {
    expect(splitDotsIntoRows(1)).toEqual([1])
    expect(splitDotsIntoRows(5)).toEqual([5])
  })

  test("splits into two rows when count exceeds 5", () => {
    expect(splitDotsIntoRows(6)).toEqual([5, 1])
    expect(splitDotsIntoRows(10)).toEqual([5, 5])
  })

  test("handles counts that span three or more rows", () => {
    expect(splitDotsIntoRows(11)).toEqual([5, 5, 1])
    expect(splitDotsIntoRows(15)).toEqual([5, 5, 5])
  })
})
