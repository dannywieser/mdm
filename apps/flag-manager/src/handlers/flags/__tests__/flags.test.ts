import { toLoggableError } from "mdm-util"

import type { FlagRedisClient } from "../flags.types"

import { logger } from "../../../logger"
import { createFlagsHandler } from "../flags"
import { getFlag, toggleFlag } from "../flags.util"

vi.mock("mdm-util", () => ({
  toLoggableError: vi.fn(),
}))

vi.mock("../../../logger", () => ({
  logger: {
    debug: vi.fn(),
    error: vi.fn(),
    info: vi.fn(),
  },
}))

vi.mock("../flags.util", () => ({
  getFlag: vi.fn(),
  toggleFlag: vi.fn(),
}))

const getFlagMock = vi.mocked(getFlag)
const toggleFlagMock = vi.mocked(toggleFlag)
const toLoggableErrorMock = vi.mocked(toLoggableError)

describe("flagsHandler interface", () => {
  const redisClient: FlagRedisClient = {
    get: vi.fn(),
    set: vi.fn(),
  }
  const flagDefinitions = {
    archived: {},
    read: { expiresInDays: 1 },
  }

  test("returns 400 when id is missing", async () => {
    const response = {
      status: vi.fn().mockReturnThis(),
      json: vi.fn(),
    }

    const handler = createFlagsHandler(redisClient, flagDefinitions)

    await handler(
      { params: { id: "", flag: "read" } } as never,
      response as never,
      vi.fn(),
    )

    expect(response.status).toHaveBeenCalledWith(400)
    expect(response.json).toHaveBeenCalledWith({
      error: "Both id and flag path params are required",
    })
    expect(toggleFlagMock).not.toHaveBeenCalled()
  })

  test("returns 400 when flag is missing", async () => {
    const response = {
      status: vi.fn().mockReturnThis(),
      json: vi.fn(),
    }

    const handler = createFlagsHandler(redisClient, flagDefinitions)

    await handler(
      { params: { id: "note-1", flag: "  " } } as never,
      response as never,
      vi.fn(),
    )

    expect(response.status).toHaveBeenCalledWith(400)
    expect(toggleFlagMock).not.toHaveBeenCalled()
  })

  test("toggles the requested flag and returns the new value", async () => {
    const response = {
      status: vi.fn().mockReturnThis(),
      json: vi.fn(),
    }

    toggleFlagMock.mockResolvedValue({ id: "note-1", flag: "read", value: true })

    const handler = createFlagsHandler(redisClient, flagDefinitions)

    await handler(
      { params: { id: " note-1 ", flag: " read " } } as never,
      response as never,
      vi.fn(),
    )

    expect(toggleFlagMock).toHaveBeenCalledWith(
      redisClient,
      {
        id: "note-1",
        flag: "read",
      },
      { expiresInDays: 1 },
    )
    expect(response.status).toHaveBeenCalledWith(200)
    expect(response.json).toHaveBeenCalledWith({
      id: "note-1",
      flag: "read",
      value: true,
    })
  })

  test("gets the requested flag and returns the current value", async () => {
    const response = {
      status: vi.fn().mockReturnThis(),
      json: vi.fn(),
    }

    getFlagMock.mockResolvedValue({ id: "note-1", flag: "read", value: false })

    const handler = createFlagsHandler(redisClient, flagDefinitions)

    await handler(
      { method: "GET", params: { id: " note-1 ", flag: " read " } } as never,
      response as never,
      vi.fn(),
    )

    expect(getFlagMock).toHaveBeenCalledWith(redisClient, {
      id: "note-1",
      flag: "read",
    })
    expect(toggleFlagMock).not.toHaveBeenCalled()
    expect(response.status).toHaveBeenCalledWith(200)
    expect(response.json).toHaveBeenCalledWith({
      id: "note-1",
      flag: "read",
      value: false,
    })
  })

  test("returns 500 when toggling fails", async () => {
    const response = {
      status: vi.fn().mockReturnThis(),
      json: vi.fn(),
    }

    const error = new Error("boom")
    toggleFlagMock.mockRejectedValue(error)
    toLoggableErrorMock.mockReturnValue({ message: "boom", stack: "stack" })

    const handler = createFlagsHandler(redisClient, flagDefinitions)

    await handler(
      { params: { id: "note-1", flag: "read" } } as never,
      response as never,
      vi.fn(),
    )

    expect(toLoggableErrorMock).toHaveBeenCalledWith(error)
    expect(logger.error).toHaveBeenCalledWith(
      { error: { message: "boom", stack: "stack" } },
      "Unable to toggle flag",
    )
    expect(response.status).toHaveBeenCalledWith(500)
    expect(response.json).toHaveBeenCalledWith({ error: "Unable to toggle flag" })
  })

  test("returns 500 when retrieving fails", async () => {
    const response = {
      status: vi.fn().mockReturnThis(),
      json: vi.fn(),
    }

    const error = new Error("boom")
    getFlagMock.mockRejectedValue(error)
    toLoggableErrorMock.mockReturnValue({ message: "boom", stack: "stack" })

    const handler = createFlagsHandler(redisClient, flagDefinitions)

    await handler(
      { method: "GET", params: { id: "note-1", flag: "read" } } as never,
      response as never,
      vi.fn(),
    )

    expect(toLoggableErrorMock).toHaveBeenCalledWith(error)
    expect(logger.error).toHaveBeenCalledWith(
      { error: { message: "boom", stack: "stack" } },
      "Unable to retrieve flag",
    )
    expect(response.status).toHaveBeenCalledWith(500)
    expect(response.json).toHaveBeenCalledWith({ error: "Unable to retrieve flag" })
  })

  test("returns 400 when flag is not configured", async () => {
    const response = {
      status: vi.fn().mockReturnThis(),
      json: vi.fn(),
    }

    const handler = createFlagsHandler(redisClient, flagDefinitions)

    await handler(
      { params: { id: "note-1", flag: "unknown" } } as never,
      response as never,
      vi.fn(),
    )

    expect(response.status).toHaveBeenCalledWith(400)
    expect(response.json).toHaveBeenCalledWith({
      error: 'Flag "unknown" is not configured',
    })
    expect(toggleFlagMock).not.toHaveBeenCalled()
  })
})
