import { isValidTimezone } from "./isValidTimezone"

describe("isValidTimezone", () => {
  test("returns true for valid IANA timezones", () => {
    expect(isValidTimezone("UTC")).toBe(true)
    expect(isValidTimezone("America/Toronto")).toBe(true)
  })

  test("returns false for invalid timezones", () => {
    expect(isValidTimezone("Not/A/Timezone")).toBe(false)
  })
})
