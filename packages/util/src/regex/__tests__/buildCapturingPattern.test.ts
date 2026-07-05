import { buildCapturingPattern } from "../buildCapturingPattern"

describe("buildCapturingPattern", () => {
  test("builds capture groups for date tokens", () => {
    const { regex, tokens } = buildCapturingPattern("YYYY.MM.DD")

    expect(tokens).toEqual(["YYYY", "MM", "DD"])
    expect(regex.exec("2024.05.27")?.slice(1)).toEqual(["2024", "05", "27"])
  })

  test("escapes non-token characters", () => {
    const { regex } = buildCapturingPattern("YYYY[MM]DD")

    expect(regex.test("2024[05]27")).toBe(true)
    expect(regex.test("2024x05x27")).toBe(false)
  })

  test("supports custom token patterns", () => {
    const { regex, tokens } = buildCapturingPattern("AA-BB", {
      AA: "([A-Z]{2})",
      BB: "(\\d{2})",
    })

    expect(tokens).toEqual(["AA", "BB"])
    expect(regex.exec("AB-12")?.slice(1)).toEqual(["AB", "12"])
  })
})
