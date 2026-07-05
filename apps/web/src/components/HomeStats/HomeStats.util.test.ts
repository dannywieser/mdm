import { describe, expect, test } from "vitest"

import { buildAttachmentBreakdown } from "./HomeStats.util"

describe("buildAttachmentBreakdown", () => {
  test("sorts entries by count descending", () => {
    expect(buildAttachmentBreakdown({ pdf: 2, png: 17, txt: 5 })).toEqual([
      { count: 17, extension: "png" },
      { count: 5, extension: "txt" },
      { count: 2, extension: "pdf" },
    ])
  })

  test("returns an empty array when there are no attachments", () => {
    expect(buildAttachmentBreakdown({})).toEqual([])
  })
})
