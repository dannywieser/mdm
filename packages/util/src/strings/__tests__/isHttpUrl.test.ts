import { isHttpUrl } from "../isHttpUrl"

describe("isHttpUrl", () => {
  test("returns true for an https URL", () => {
    expect(isHttpUrl("https://example.com/photo.png")).toBe(true)
  })

  test("returns true for an http URL", () => {
    expect(isHttpUrl("http://example.com/photo.png")).toBe(true)
  })

  test("returns true for a protocol-relative URL", () => {
    expect(isHttpUrl("//example.com/photo.png")).toBe(true)
  })

  test("returns false for a javascript URL", () => {
    expect(isHttpUrl("javascript:alert(1)")).toBe(false)
  })

  test("returns false for a data URL", () => {
    expect(isHttpUrl("data:image/png;base64,abc123")).toBe(false)
  })

  test("returns false for an obsidian URL", () => {
    expect(isHttpUrl("obsidian://open?vault=v&file=note")).toBe(false)
  })

  test("returns false for a fragment reference", () => {
    expect(isHttpUrl("#photo")).toBe(false)
  })

  test("returns false for a relative local path", () => {
    expect(isHttpUrl("attachments/photo.png")).toBe(false)
  })
})
