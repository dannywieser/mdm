import { habitHandler } from "./habit"

describe("habitHandler", () => {
  test("responds with an empty placeholder payload", () => {
    const json = vi.fn()
    const response = { status: vi.fn().mockReturnValue({ json }) }

    habitHandler({ params: { key: "morning-routine" } } as never, response as never, vi.fn())

    expect(response.status).toHaveBeenCalledWith(200)
    expect(json).toHaveBeenCalledWith({})
  })
})
