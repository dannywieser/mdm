import { ChakraProvider, StatRoot, defaultSystem } from "@chakra-ui/react"
import { render, screen } from "@testing-library/react"
import { describe, expect, test } from "vitest"

import { HabitScoreValue } from "./HabitScoreValue"
import { getDoLessScoreStatus, getHabitScoreColor } from "./HabitScoreValue.util"

const renderValue = (props: Parameters<typeof HabitScoreValue>[0]) =>
  render(
    <ChakraProvider value={defaultSystem}>
      <StatRoot>
        <HabitScoreValue {...props} />
      </StatRoot>
    </ChakraProvider>,
  )

describe("HabitScoreValue", () => {
  test("renders the score", () => {
    renderValue({ mode: "do-more", score: 525 })

    expect(screen.getByText("525")).toBeTruthy()
  })
})

describe("getDoLessScoreStatus", () => {
  test("returns neutral when no targetScore is configured", () => {
    expect(getDoLessScoreStatus(80)).toBe("neutral")
  })

  test("returns green below 50% of the target", () => {
    expect(getDoLessScoreStatus(0, 100)).toBe("green")
    expect(getDoLessScoreStatus(49, 100)).toBe("green")
  })

  test("returns yellow between 50% and 75% of the target", () => {
    expect(getDoLessScoreStatus(50, 100)).toBe("yellow")
    expect(getDoLessScoreStatus(74, 100)).toBe("yellow")
  })

  test("returns red at or above 75% of the target", () => {
    expect(getDoLessScoreStatus(75, 100)).toBe("red")
    expect(getDoLessScoreStatus(150, 100)).toBe("red")
  })
})

describe("getHabitScoreColor", () => {
  test("always uses the accent color for do-more habits", () => {
    expect(getHabitScoreColor("do-more", 0)).toBe("app.accent")
    expect(getHabitScoreColor("do-more", 1000, 100)).toBe("app.accent")
  })

  test("maps do-less status to a status color", () => {
    expect(getHabitScoreColor("do-less", 10, 100)).toBe("green.500")
    expect(getHabitScoreColor("do-less", 60, 100)).toBe("yellow.500")
    expect(getHabitScoreColor("do-less", 90, 100)).toBe("red.500")
  })

  test("falls back to the neutral text color when no targetScore is configured", () => {
    expect(getHabitScoreColor("do-less", 60)).toBe("app.text")
  })
})
