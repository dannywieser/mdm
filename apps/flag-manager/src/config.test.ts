import { AppConfigError, readAppConfigFile } from "app-config"
import { isNonEmptyString } from "mdm-util"

import { FlagConfigError, resolveFlagDefinitions } from "./config"

vi.mock("app-config", () => ({
  AppConfigError: class AppConfigError extends Error {},
  readAppConfigFile: vi.fn(),
}))

vi.mock("mdm-util", () => ({
  isNonEmptyString: vi.fn(),
}))

const isNonEmptyStringMock = vi.mocked(isNonEmptyString)
const readAppConfigFileMock = vi.mocked(readAppConfigFile)

describe("flag-manager config", () => {
  beforeEach(() => {
    isNonEmptyStringMock.mockImplementation(
      (value): value is string =>
        typeof value === "string" && value.trim().length > 0,
    )
  })

  test("resolves configured flags with and without expiry", async () => {
    readAppConfigFileMock.mockResolvedValue({
      flags: {
        archived: {},
        read: {
          expiresInSeconds: 300,
        },
      },
    })

    await expect(resolveFlagDefinitions()).resolves.toEqual({
      archived: {},
      read: {
        expiresInSeconds: 300,
      },
    })
  })

  test("throws when flags configuration is missing", async () => {
    readAppConfigFileMock.mockResolvedValue({})

    await expect(resolveFlagDefinitions()).rejects.toEqual(
      new FlagConfigError(
        "app.config.json flags must be an object keyed by flag name",
      ),
    )
  })

  test("throws when flag definition expiry is invalid", async () => {
    readAppConfigFileMock.mockResolvedValue({
      flags: {
        read: {
          expiresInSeconds: 0,
        },
      },
    })

    await expect(resolveFlagDefinitions()).rejects.toEqual(
      new FlagConfigError(
        "app.config.json flags must map non-empty flag names to definitions with optional positive integer expiresInSeconds",
      ),
    )
  })

  test("wraps app config errors as flag config errors", async () => {
    readAppConfigFileMock.mockRejectedValue(
      new AppConfigError("app.config.json must be readable"),
    )

    await expect(resolveFlagDefinitions()).rejects.toEqual(
      new FlagConfigError("app.config.json must be readable"),
    )
  })
})
