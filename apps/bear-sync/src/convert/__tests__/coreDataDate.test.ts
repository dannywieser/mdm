import { coreDataTimestampToISOString } from "../coreDataDate"

describe("coreDataTimestampToISOString", () => {
  test("converts a Core Data reference-date timestamp to an ISO string", () => {
    expect(coreDataTimestampToISOString(0)).toBe("2001-01-01T00:00:00.000Z")
  })

  test("converts a real Bear ZCREATIONDATE value", () => {
    expect(coreDataTimestampToISOString(665979131)).toBe("2022-02-08T02:12:11.000Z")
  })
})
