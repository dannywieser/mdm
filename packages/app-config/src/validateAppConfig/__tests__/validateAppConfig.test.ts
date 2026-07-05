import { validateAppConfig } from "../validateAppConfig"

vi.mock("../../habits/habits", () => ({
  validateHabits: vi.fn().mockReturnValue([]),
}))

vi.mock("../../views/views", () => ({
  validateViews: vi.fn().mockReturnValue([]),
}))

const VALID_RAW = { obsidianVault: "vault" }

describe("validateAppConfig", () => {
  test("returns validated config for minimal valid input", () => {
    expect(validateAppConfig(VALID_RAW)).toEqual({
      dateFormats: undefined,
      habits: [],
      obsidianVault: "vault",
      timezone: undefined,
      views: [],
    })
  })

  test("throws when input is not an object", () => {
    expect(() => validateAppConfig("not-an-object")).toThrow(
      "app.config.json must be a JSON object",
    )
  })

  test("throws when input is null", () => {
    expect(() => validateAppConfig(null)).toThrow(
      "app.config.json must be a JSON object",
    )
  })

  test("throws when obsidianVault is missing", () => {
    expect(() => validateAppConfig({})).toThrow(
      "app.config.json requires a non-empty obsidianVault value",
    )
  })

  test("throws when obsidianVault is an empty string", () => {
    expect(() => validateAppConfig({ obsidianVault: "" })).toThrow(
      "app.config.json requires a non-empty obsidianVault value",
    )
  })

  test("throws when obsidianVault is not a string", () => {
    expect(() => validateAppConfig({ obsidianVault: 42 })).toThrow(
      "app.config.json requires a non-empty obsidianVault value",
    )
  })

  test("returns undefined dateFormats when omitted", () => {
    expect(validateAppConfig(VALID_RAW)).toMatchObject({
      dateFormats: undefined,
    })
  })

  test("returns validated dateFormats when provided", () => {
    expect(
      validateAppConfig({ ...VALID_RAW, dateFormats: ["YYYY.MM.DD"] }),
    ).toMatchObject({ dateFormats: ["YYYY.MM.DD"] })
  })

  test("throws when dateFormats is not an array of non-empty strings", () => {
    expect(() =>
      validateAppConfig({ ...VALID_RAW, dateFormats: ["YYYY.MM.DD", ""] }),
    ).toThrow("app.config.json dateFormats must be an array of non-empty strings")
  })

  test("returns undefined timezone when omitted", () => {
    expect(validateAppConfig(VALID_RAW)).toMatchObject({ timezone: undefined })
  })

  test("returns validated timezone when provided", () => {
    expect(
      validateAppConfig({ ...VALID_RAW, timezone: "UTC" }),
    ).toMatchObject({ timezone: "UTC" })
  })

  test("throws when timezone is not a valid IANA identifier", () => {
    expect(() =>
      validateAppConfig({ ...VALID_RAW, timezone: "Not/Valid" }),
    ).toThrow(
      "app.config.json timezone must be a valid IANA timezone identifier",
    )
  })

  test("throws when timezone is an empty string", () => {
    expect(() =>
      validateAppConfig({ ...VALID_RAW, timezone: "" }),
    ).toThrow(
      "app.config.json timezone must be a valid IANA timezone identifier",
    )
  })
})
