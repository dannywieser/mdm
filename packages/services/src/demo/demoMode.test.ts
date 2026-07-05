import { afterEach, describe, expect, test } from "vitest"

import {
  configureDemoMode,
  getDemoDataBasePath,
  isDemoMode,
  resetDemoMode,
} from "./demoMode"

afterEach(() => {
  resetDemoMode()
})

describe("demoMode", () => {
  test("is disabled by default", () => {
    expect(isDemoMode()).toBe(false)
    expect(() => getDemoDataBasePath()).toThrow("Demo mode is not configured")
  })

  test("enables demo mode with the configured base path", () => {
    configureDemoMode({ dataBasePath: "/demo-data" })

    expect(isDemoMode()).toBe(true)
    expect(getDemoDataBasePath()).toBe("/demo-data")
  })

  test("strips trailing slashes from the base path", () => {
    configureDemoMode({ dataBasePath: "/mdm/demo-data/" })

    expect(getDemoDataBasePath()).toBe("/mdm/demo-data")
  })

  test("resetDemoMode disables demo mode again", () => {
    configureDemoMode({ dataBasePath: "/demo-data" })
    resetDemoMode()

    expect(isDemoMode()).toBe(false)
  })
})
