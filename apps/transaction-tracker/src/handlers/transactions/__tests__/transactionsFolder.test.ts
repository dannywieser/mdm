import { isInFolder } from "../transactionsFolder"

describe("isInFolder", () => {
  test("accepts any path when no folder is configured", () => {
    expect(isInFolder("journal/a", "")).toBe(true)
  })

  test("accepts the folder itself", () => {
    expect(isInFolder("finance", "finance")).toBe(true)
  })

  test("accepts a path inside the folder", () => {
    expect(isInFolder("finance/a", "finance")).toBe(true)
  })

  test("accepts a deeply nested path", () => {
    expect(isInFolder("finance/2026/03/a", "finance")).toBe(true)
  })

  test("rejects a path outside the folder", () => {
    expect(isInFolder("journal/a", "finance")).toBe(false)
  })

  test("rejects a sibling folder sharing the configured folder's prefix", () => {
    expect(isInFolder("financial/a", "finance")).toBe(false)
  })

  test("tolerates leading and trailing slashes on the configured folder", () => {
    expect(isInFolder("finance/a", "/finance/")).toBe(true)
  })

  test("treats a folder of only slashes as unconfigured", () => {
    expect(isInFolder("journal/a", "///")).toBe(true)
  })

  test("matches a nested configured folder", () => {
    expect(isInFolder("finance/transactions/a", "finance/transactions")).toBe(true)
  })
})
