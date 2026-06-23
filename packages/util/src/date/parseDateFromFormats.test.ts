import { parseDateFromFormats } from "./parseDateFromFormats"

describe("parseDateFromFormats", () => {
  test("parses a yyyy.MM.dd date string", () => {
    expect(parseDateFromFormats("2024.05.27", ["yyyy.MM.dd"])).toEqual({
      day: 27,
      month: 5,
      year: 2024,
    })
  })

  test("parses a yy/MM/dd date string, interpreting yy as 2000 + yy", () => {
    expect(parseDateFromFormats("24/05/27", ["yy/MM/dd"])).toEqual({
      day: 27,
      month: 5,
      year: 2024,
    })
  })

  test("tries each format in order and returns the first match", () => {
    expect(parseDateFromFormats("2024.05.27", ["yy/MM/dd", "yyyy.MM.dd"])).toEqual({
      day: 27,
      month: 5,
      year: 2024,
    })
  })

  test("returns null when no format matches", () => {
    expect(parseDateFromFormats("not-a-date", ["yyyy.MM.dd"])).toBeNull()
  })

  test("returns null when formats list is empty", () => {
    expect(parseDateFromFormats("2024.05.27", [])).toBeNull()
  })

  test("requires an exact full-string match", () => {
    expect(parseDateFromFormats("prefix-2024.05.27", ["yyyy.MM.dd"])).toBeNull()
    expect(parseDateFromFormats("2024.05.27-suffix", ["yyyy.MM.dd"])).toBeNull()
  })
})
