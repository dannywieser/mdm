import { ChakraProvider, StatRoot, defaultSystem } from "@chakra-ui/react"
import { cleanup, render, screen } from "@testing-library/react"
import { afterEach, describe, expect, test, vi } from "vitest"

import { HabitScoreValue } from "./HabitScoreValue"

const getHabitScoreColorMock = vi.fn()
const getHabitScoreOverageMock = vi.fn()

vi.mock("./HabitScoreValue.util", () => ({
  getHabitScoreColor: (...args: unknown[]) => getHabitScoreColorMock(...args),
  getHabitScoreOverage: (...args: unknown[]) => getHabitScoreOverageMock(...args),
}))

afterEach(cleanup)

const renderValue = (props: Parameters<typeof HabitScoreValue>[0]) =>
  render(
    <ChakraProvider value={defaultSystem}>
      <StatRoot>
        <HabitScoreValue {...props} />
      </StatRoot>
    </ChakraProvider>,
  )

describe("HabitScoreValue", () => {
  test("renders the score when there is no overage", () => {
    getHabitScoreColorMock.mockReturnValue("app.accent")
    getHabitScoreOverageMock.mockReturnValue(undefined)

    renderValue({ mode: "do-more", score: 525 })

    expect(screen.getByText("525")).toBeTruthy()
    expect(screen.queryByText(/^\(\+/)).toBeNull()
  })

  test("renders the target score with the overage in brackets", () => {
    getHabitScoreColorMock.mockReturnValue("red.500")
    getHabitScoreOverageMock.mockReturnValue(150)

    renderValue({ mode: "do-less", score: 250, targetScore: 100 })

    expect(screen.getByText("100")).toBeTruthy()
    expect(screen.getByText("(+150)")).toBeTruthy()
  })
})
