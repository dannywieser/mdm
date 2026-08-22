import { describe, expect, test } from "vitest"

import { formatAmount, resolveAmountColor } from "../TransactionAmount.util"

describe("formatAmount", () => {
  test("formats a positive amount without a sign by default", () => {
    expect(formatAmount(1200.5, "USD", false)).toBe("$1,200.50")
  })

  test("drops the sign of a negative amount when not asked to show it", () => {
    expect(formatAmount(-42.5, "USD", false)).toBe("$42.50")
  })

  test("prefixes a negative amount with a minus when showing the sign", () => {
    expect(formatAmount(-42.5, "USD", true)).toBe("-$42.50")
  })

  test("prefixes a positive amount with a plus when showing the sign", () => {
    expect(formatAmount(42.5, "USD", true)).toBe("+$42.50")
  })

  test("renders zero as a positive signed amount", () => {
    expect(formatAmount(0, "USD", true)).toBe("+$0.00")
  })

  test("honours the configured currency", () => {
    expect(formatAmount(10, "EUR", false)).toBe("€10.00")
  })
})

describe("resolveAmountColor", () => {
  test("uses the negative token for money out", () => {
    expect(resolveAmountColor(-1)).toBe("app.negativeText")
  })

  test("uses the positive token for money in", () => {
    expect(resolveAmountColor(1)).toBe("app.positiveText")
  })

  test("treats zero as money in", () => {
    expect(resolveAmountColor(0)).toBe("app.positiveText")
  })
})
