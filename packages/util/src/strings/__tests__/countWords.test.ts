import { countWords } from "../countWords"

describe("countWords", () => {
  test("counts words separated by single spaces", () => {
    expect(countWords("the quick brown fox")).toBe(4)
  })

  test("treats runs of whitespace as a single separator", () => {
    expect(countWords("the  quick\n\nbrown\tfox")).toBe(4)
  })

  test("ignores leading and trailing whitespace", () => {
    expect(countWords("  hello world  ")).toBe(2)
  })

  test("returns 0 for an empty string", () => {
    expect(countWords("")).toBe(0)
  })

  test("returns 0 for a whitespace-only string", () => {
    expect(countWords("   \n\t  ")).toBe(0)
  })
})
