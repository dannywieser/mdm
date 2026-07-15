import { cleanup, render } from "@testing-library/react"
import { configureDemoMode, resetDemoMode } from "services"
import { afterEach, describe, expect, test } from "vitest"

import { useNoteLink } from "../useNoteLink"

const NOTE_ID = "my-note"
const OBSIDIAN_URL = "obsidian://open?vault=dgw&file=daily%2Fmy-note"

const TestComponent = () => {
  const { href, isDemo } = useNoteLink({ id: NOTE_ID, obsidianUrl: OBSIDIAN_URL })
  return <div data-href={href} data-is-demo={isDemo} data-testid="result" />
}

afterEach(() => {
  cleanup()
  resetDemoMode()
})

describe("useNoteLink", () => {
  test("resolves to the note's obsidianUrl outside of demo mode", () => {
    const { getByTestId } = render(<TestComponent />)

    const result = getByTestId("result")
    expect(result.dataset.href).toBe(OBSIDIAN_URL)
    expect(result.dataset.isDemo).toBe("false")
  })

  test("resolves to the in-app note source route in demo mode", () => {
    configureDemoMode({ dataBasePath: "/demo-data" })

    const { getByTestId } = render(<TestComponent />)

    const result = getByTestId("result")
    expect(result.dataset.href).toBe("/source/my-note")
    expect(result.dataset.isDemo).toBe("true")
  })
})
