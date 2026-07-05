import { buildObsidianUrl } from "../buildObsidianUrl"

describe("buildObsidianUrl", () => {
  test("builds an obsidian deep link relative to the notes directory", () => {
    expect(buildObsidianUrl("vault", "/notes", "/notes/topic/welcome.md")).toBe(
      "obsidian://open?vault=vault&file=topic%2Fwelcome",
    )
  })

  test("percent-encodes vault names and path segments", () => {
    expect(
      buildObsidianUrl("vault name", "/notes", "/notes/daily/2026.05.27 (Wed) á.md"),
    ).toBe("obsidian://open?vault=vault%20name&file=daily%2F2026.05.27%20(Wed)%20%C3%A1")
  })

  test("strips the file extension", () => {
    expect(buildObsidianUrl("vault", "/notes", "/notes/2026.05.31.markdown")).toBe(
      "obsidian://open?vault=vault&file=2026.05.31",
    )
  })
})
