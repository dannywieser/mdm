import { ChakraProvider, defaultSystem } from "@chakra-ui/react"
import { cleanup, render } from "@testing-library/react"
import { afterEach, describe, expect, test } from "vitest"

import { HabitScoreProgress } from "./HabitScoreProgress"

afterEach(cleanup)

const renderProgress = (score: number, targetScore: number | undefined) =>
  render(
    <ChakraProvider value={defaultSystem}>
      <HabitScoreProgress score={score} targetScore={targetScore} />
    </ChakraProvider>,
  )

describe("HabitScoreProgress", () => {
  test("renders nothing when there is no target score", () => {
    const { container } = renderProgress(50, undefined)

    expect(container.querySelector('[role="progressbar"]')).toBeNull()
  })

  test("fills the bar proportionally to the target when under it", () => {
    const { container } = renderProgress(50, 100)

    const bar = container.querySelector('[role="progressbar"]')

    expect(bar?.getAttribute("aria-valuenow")).toBe("50")
  })

  test("fills the bar fully and adds a red overflow segment when over the target", () => {
    const { container } = renderProgress(150, 100)

    const bar = container.querySelector('[role="progressbar"]')

    expect(bar?.getAttribute("aria-valuenow")).toBe("100")
    expect(container.querySelectorAll('[role="progressbar"]')).toHaveLength(1)
    expect(container.firstElementChild?.children).toHaveLength(2)
  })
})
