import { beforeEach, describe, expect, test } from "vitest"

import { readDemoFlag, toggleDemoFlag } from "../demoFlags"

beforeEach(() => {
  window.sessionStorage.clear()
})

describe("readDemoFlag", () => {
  test("returns false for unset flags", () => {
    expect(readDemoFlag("note-1", "read")).toBe(false)
  })

  test("returns true for a flag stored in session storage", () => {
    window.sessionStorage.setItem("mdm-demo-flag:read:note-1", "true")

    expect(readDemoFlag("note-1", "read")).toBe(true)
  })
})

describe("toggleDemoFlag", () => {
  test("turns a flag on and reports the new value", () => {
    expect(toggleDemoFlag("note-1", "read")).toBe(true)
    expect(readDemoFlag("note-1", "read")).toBe(true)
  })

  test("turns a flag off again and removes the stored key", () => {
    toggleDemoFlag("note-1", "read")

    expect(toggleDemoFlag("note-1", "read")).toBe(false)
    expect(window.sessionStorage.getItem("mdm-demo-flag:read:note-1")).toBeNull()
  })

  test("tracks flags per note", () => {
    toggleDemoFlag("note-1", "read")

    expect(readDemoFlag("note-2", "read")).toBe(false)
  })
})
