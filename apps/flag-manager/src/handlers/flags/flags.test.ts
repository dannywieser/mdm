import { toLoggableError } from "mdm-util"

import type { FlagRedisClient } from "./flags.types"

import { createFlagsHandler } from "./flags"
import { toggleFlag } from "./flags.util"

jest.mock("mdm-util", () => ({
  toLoggableError: jest.fn(),
}))

jest.mock("./flags.util", () => ({
  toggleFlag: jest.fn(),
}))

const toggleFlagMock = jest.mocked(toggleFlag)
const toLoggableErrorMock = jest.mocked(toLoggableError)

describe("flagsHandler interface", () => {
  const redisClient: FlagRedisClient = {
    get: jest.fn(),
    set: jest.fn(),
  }

  test("returns 400 when id is missing", async () => {
    const response = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    }

    const handler = createFlagsHandler(redisClient)

    await handler(
      { params: { id: "", flag: "read" } } as never,
      response as never,
      jest.fn(),
    )

    expect(response.status).toHaveBeenCalledWith(400)
    expect(response.json).toHaveBeenCalledWith({
      error: "Both id and flag path params are required",
    })
    expect(toggleFlagMock).not.toHaveBeenCalled()
  })

  test("returns 400 when flag is missing", async () => {
    const response = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    }

    const handler = createFlagsHandler(redisClient)

    await handler(
      { params: { id: "note-1", flag: "  " } } as never,
      response as never,
      jest.fn(),
    )

    expect(response.status).toHaveBeenCalledWith(400)
    expect(toggleFlagMock).not.toHaveBeenCalled()
  })

  test("toggles the requested flag and returns the new value", async () => {
    const response = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    }

    toggleFlagMock.mockResolvedValue({ id: "note-1", flag: "read", value: true })

    const handler = createFlagsHandler(redisClient)

    await handler(
      { params: { id: " note-1 ", flag: " read " } } as never,
      response as never,
      jest.fn(),
    )

    expect(toggleFlagMock).toHaveBeenCalledWith(redisClient, {
      id: "note-1",
      flag: "read",
    })
    expect(response.status).toHaveBeenCalledWith(200)
    expect(response.json).toHaveBeenCalledWith({
      id: "note-1",
      flag: "read",
      value: true,
    })
  })

  test("returns 500 when toggling fails", async () => {
    const response = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    }
    const errorSpy = jest.spyOn(console, "error").mockImplementation()

    const error = new Error("boom")
    toggleFlagMock.mockRejectedValue(error)
    toLoggableErrorMock.mockReturnValue({ message: "boom", stack: "stack" })

    const handler = createFlagsHandler(redisClient)

    await handler(
      { params: { id: "note-1", flag: "read" } } as never,
      response as never,
      jest.fn(),
    )

    expect(toLoggableErrorMock).toHaveBeenCalledWith(error)
    expect(errorSpy).toHaveBeenCalledWith("Unable to toggle flag", {
      message: "boom",
      stack: "stack",
    })
    expect(response.status).toHaveBeenCalledWith(500)
    expect(response.json).toHaveBeenCalledWith({ error: "Unable to toggle flag" })

    errorSpy.mockRestore()
  })
})
