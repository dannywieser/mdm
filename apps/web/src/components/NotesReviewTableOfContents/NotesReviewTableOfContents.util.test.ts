import { describe, expect, test } from "vitest"

import { getNoteColor } from "./NotesReviewTableOfContents.util"

describe("getNoteColor", () => {
  test("returns accent color when note is current index", () => {
    expect(getNoteColor(true, false)).toBe("app.accent")
  })

  test("returns accent color when note is current index and also read", () => {
    expect(getNoteColor(true, true)).toBe("app.accent")
  })

  test("returns muted color for a read note that is not current", () => {
    expect(getNoteColor(false, true)).toBe("app.textMuted")
  })

  test("returns default text color for an unread note that is not current", () => {
    expect(getNoteColor(false, false)).toBe("app.text")
  })
})
