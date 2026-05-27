import { toLoggableError } from "./toLoggableError"

describe("toLoggableError", () => {
  test("returns message and stack for Error instances", () => {
    const error = new Error("boom")

    expect(toLoggableError(error)).toEqual({
      message: "boom",
      stack: error.stack,
    })
  })

  test("returns original value for non-Error values", () => {
    expect(toLoggableError("boom")).toBe("boom")
  })
})
