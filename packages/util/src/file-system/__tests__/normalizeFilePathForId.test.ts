import { normalizeFilePathForId } from "../normalizeFilePathForId"

describe("normalizeFilePathForId", () => {
  test("normalizes path separators for stable IDs", () => {
    expect(normalizeFilePathForId("notes\\topic\\welcome.md")).toBe(
      "notes/topic/welcome.md",
    )
  })
})
