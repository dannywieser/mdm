import { isNonEmptyString } from "mdm-util"
import { promises as fs } from "node:fs"

import { FlagConfigError, resolveFlagDefinitions } from "./config"

jest.mock("node:fs", () => ({
  promises: {
    access: jest.fn(),
    readFile: jest.fn(),
  },
}))

jest.mock("mdm-util", () => ({
  isNonEmptyString: jest.fn(),
}))

const accessMock = jest.mocked(fs.access)
const isNonEmptyStringMock = jest.mocked(isNonEmptyString)
const readFileMock = jest.mocked(fs.readFile)

describe("flag-manager config", () => {
  beforeEach(() => {
    accessMock.mockResolvedValue(undefined)
    isNonEmptyStringMock.mockImplementation(
      (value): value is string =>
        typeof value === "string" && value.trim().length > 0,
    )
  })

  test("resolves configured flags with and without expiry", async () => {
    readFileMock.mockResolvedValue(
      JSON.stringify({
        flags: {
          archived: {},
          read: {
            expiresInSeconds: 300,
          },
        },
      }),
    )

    await expect(resolveFlagDefinitions()).resolves.toEqual({
      archived: {},
      read: {
        expiresInSeconds: 300,
      },
    })
  })

  test("throws when flags configuration is missing", async () => {
    readFileMock.mockResolvedValue(JSON.stringify({}))

    await expect(resolveFlagDefinitions()).rejects.toEqual(
      new FlagConfigError(
        "app.config.json flags must be an object keyed by flag name",
      ),
    )
  })

  test("throws when flag definition expiry is invalid", async () => {
    readFileMock.mockResolvedValue(
      JSON.stringify({
        flags: {
          read: {
            expiresInSeconds: 0,
          },
        },
      }),
    )

    await expect(resolveFlagDefinitions()).rejects.toEqual(
      new FlagConfigError(
        "app.config.json flags must map non-empty flag names to definitions with optional positive integer expiresInSeconds",
      ),
    )
  })
})
