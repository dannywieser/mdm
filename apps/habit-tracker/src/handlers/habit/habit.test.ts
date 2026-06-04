import { habitHandler } from "./habit"

describe("habitHandler", () => {
  test("responds with an empty placeholder payload", () => {
    const firstJson = vi.fn()
    const secondJson = vi.fn()
    const firstResponse = { status: vi.fn().mockReturnValue({ json: firstJson }) }
    const secondResponse = {
      status: vi.fn().mockReturnValue({ json: secondJson }),
    }

    habitHandler(
      { params: { key: "morning-routine" } } as never,
      firstResponse as never,
      vi.fn(),
    )
    habitHandler(
      { params: { key: "evening-walk" } } as never,
      secondResponse as never,
      vi.fn(),
    )

    expect(firstResponse.status).toHaveBeenCalledWith(200)
    expect(secondResponse.status).toHaveBeenCalledWith(200)
    expect(firstJson).toHaveBeenCalledWith({})
    expect(secondJson).toHaveBeenCalledWith({})
  })
})
