import { describe, expect, test } from "vitest"

import { buildAlignProps, resolveDetailAlign } from "../TransactionDayDetail.util"

describe("resolveDetailAlign", () => {
  test("anchors the first column to its start edge", () => {
    // 2026-03-01 is a Sunday.
    expect(resolveDetailAlign("2026-03-01")).toBe("start")
  })

  test("anchors the last column to its end edge", () => {
    // 2026-03-07 is a Saturday.
    expect(resolveDetailAlign("2026-03-07")).toBe("end")
  })

  test("centres a midweek column", () => {
    expect(resolveDetailAlign("2026-03-04")).toBe("center")
  })

  test("centres the column before the last", () => {
    expect(resolveDetailAlign("2026-03-06")).toBe("center")
  })
})

describe("buildAlignProps", () => {
  test("pins a start-aligned panel to the left with no transform", () => {
    expect(buildAlignProps("start")).toEqual({ left: "0" })
  })

  test("pins an end-aligned panel to the right with no transform", () => {
    expect(buildAlignProps("end")).toEqual({ right: "0" })
  })

  test("centres a centre-aligned panel over the cell", () => {
    expect(buildAlignProps("center")).toEqual({ left: "50%", transform: "translateX(-50%)" })
  })
})
