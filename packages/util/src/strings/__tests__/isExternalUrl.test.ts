import { isExternalUrl } from "../isExternalUrl"

describe("isExternalUrl", () => {
  test("returns true for an https URL", () => {
    expect(isExternalUrl("https://example.com/photo.png")).toBe(true)
  })

  test("returns true for an http URL", () => {
    expect(isExternalUrl("http://example.com/photo.png")).toBe(true)
  })

  test("returns true for a protocol-relative URL", () => {
    expect(isExternalUrl("//example.com/photo.png")).toBe(true)
  })

  test("returns true for a fragment reference", () => {
    expect(isExternalUrl("#photo")).toBe(true)
  })

  test("returns true for an arbitrary URL scheme", () => {
    expect(isExternalUrl("obsidian://open?vault=v&file=note")).toBe(true)
  })

  test("returns false for a relative local path", () => {
    expect(isExternalUrl("attachments/photo.png")).toBe(false)
  })

  test("returns false for an absolute local path", () => {
    expect(isExternalUrl("/attachments/photo.png")).toBe(false)
  })

  test("returns false for a bare filename", () => {
    expect(isExternalUrl("photo.png")).toBe(false)
  })
})
