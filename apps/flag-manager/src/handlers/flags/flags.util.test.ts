import type { FlagRedisClient } from "./flags.types"

import {
  createFlagRedisKey,
  getFlag,
  parseFlagValue,
  toRedisFlagValue,
  toggleFlag,
} from "./flags.util"

describe("flags util", () => {
  test("builds redis keys in the expected flag:id format", () => {
    expect(createFlagRedisKey({ id: "note-1", flag: "read" })).toBe(
      "read:note-1",
    )
  })

  test("parses redis true values as true", () => {
    expect(parseFlagValue("true")).toBe(true)
  })

  test("parses redis null and false values as false", () => {
    expect(parseFlagValue(null)).toBe(false)
    expect(parseFlagValue("false")).toBe(false)
  })

  test("serializes booleans to redis strings", () => {
    expect(toRedisFlagValue(true)).toBe("true")
    expect(toRedisFlagValue(false)).toBe("false")
  })

  test("toggles from false to true when key is missing", async () => {
    const redisClient: FlagRedisClient = {
      get: vi.fn().mockResolvedValue(null),
      set: vi.fn().mockResolvedValue("OK"),
    }

    const result = await toggleFlag(redisClient, { id: "a", flag: "read" })

    expect(redisClient.get).toHaveBeenCalledWith("read:a")
    expect(redisClient.set).toHaveBeenCalledWith("read:a", "true")
    expect(result).toEqual({ id: "a", flag: "read", value: true })
  })

  test("returns current flag value without mutating redis", async () => {
    const redisClient: FlagRedisClient = {
      get: vi.fn().mockResolvedValue("true"),
      set: vi.fn().mockResolvedValue("OK"),
    }

    const result = await getFlag(redisClient, { id: "a", flag: "read" })

    expect(redisClient.get).toHaveBeenCalledWith("read:a")
    expect(redisClient.set).not.toHaveBeenCalled()
    expect(result).toEqual({ id: "a", flag: "read", value: true })
  })

  test("toggles from true to false when key exists", async () => {
    const redisClient: FlagRedisClient = {
      get: vi.fn().mockResolvedValue("true"),
      set: vi.fn().mockResolvedValue("OK"),
    }

    const result = await toggleFlag(redisClient, { id: "a", flag: "read" })

    expect(redisClient.set).toHaveBeenCalledWith("read:a", "false")
    expect(result).toEqual({ id: "a", flag: "read", value: false })
  })

  test("sets redis expiry when flag definition includes expiresInDays", async () => {
    const redisClient: FlagRedisClient = {
      get: vi.fn().mockResolvedValue(null),
      set: vi.fn().mockResolvedValue("OK"),
    }

    const result = await toggleFlag(
      redisClient,
      { id: "a", flag: "read" },
      { expiresInDays: 1 },
    )

    expect(redisClient.set).toHaveBeenCalledWith("read:a", "true", {
      EX: 86400,
    })
    expect(result).toEqual({ id: "a", flag: "read", value: true })
  })
})
