import { buildBearUrl } from "../buildBearUrl"

describe("buildBearUrl", () => {
  test("builds an open-note deep link for the given id", () => {
    expect(buildBearUrl("81C0CD56-B6B9-4DDF-8BC1-3FE4A675B126")).toBe(
      "bear://x-callback-url/open-note?id=81C0CD56-B6B9-4DDF-8BC1-3FE4A675B126",
    )
  })

  test("percent-encodes special characters in the id", () => {
    expect(buildBearUrl("a b&c")).toBe("bear://x-callback-url/open-note?id=a%20b%26c")
  })
})
