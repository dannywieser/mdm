import { parseDateFromFormats } from "./parseDateFromFormats"

describe("parseDateFromFormats", () => {
  test("parses a YYYY.MM.DD date string", () => {
    expect(parseDateFromFormats("2024.05.27", ["YYYY.MM.DD"])).toEqual({
      day: 27,
      month: 5,
      year: 2024,
    })
  })

  test("parses a YY/MM/DD date string, interpreting YY as 2000 + YY", () => {
    expect(parseDateFromFormats("24/05/27", ["YY/MM/DD"])).toEqual({
      day: 27,
      month: 5,
      year: 2024,
    })
  })

  test("tries each format in order and returns the first match", () => {
    expect(parseDateFromFormats("2024.05.27", ["YY/MM/DD", "YYYY.MM.DD"])).toEqual({
      day: 27,
      month: 5,
      year: 2024,
    })
  })

  test("returns null when no format matches", () => {
    expect(parseDateFromFormats("not-a-date", ["YYYY.MM.DD"])).toBeNull()
  })

  test("returns null when formats list is empty", () => {
    expect(parseDateFromFormats("2024.05.27", [])).toBeNull()
  })

  test("requires an exact full-string match", () => {
    expect(parseDateFromFormats("prefix-2024.05.27", ["YYYY.MM.DD"])).toBeNull()
    expect(parseDateFromFormats("2024.05.27-suffix", ["YYYY.MM.DD"])).toBeNull()
  })
})
