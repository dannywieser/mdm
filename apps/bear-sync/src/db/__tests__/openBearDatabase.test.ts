import Database from "better-sqlite3"

import { openBearDatabase } from "../openBearDatabase"

vi.mock("better-sqlite3", () => ({
  default: vi.fn(),
}))

const DatabaseMock = vi.mocked(Database)

describe("openBearDatabase", () => {
  test("opens a read-only connection requiring the file to exist", () => {
    openBearDatabase("/mock-tmp/database.sqlite")

    expect(DatabaseMock).toHaveBeenCalledWith("/mock-tmp/database.sqlite", {
      fileMustExist: true,
      readonly: true,
    })
  })
})
