import { daysToSeconds } from "./daysToSeconds"

describe("daysToSeconds", () => {
  test("converts a single day to seconds", () => {
    expect(daysToSeconds(1)).toBe(86400)
  })

  test("converts multiple days to seconds", () => {
    expect(daysToSeconds(7)).toBe(604800)
  })

  test("converts zero days to zero seconds", () => {
    expect(daysToSeconds(0)).toBe(0)
  })
})
