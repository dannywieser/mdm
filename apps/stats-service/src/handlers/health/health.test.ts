import { healthHandler } from "./health"

describe("healthHandler", () => {
  test("responds with 200 and ok status", () => {
    const json = vi.fn()
    const response = { status: vi.fn().mockReturnValue({ json }) }

    healthHandler({} as never, response as never, vi.fn())

    expect(response.status).toHaveBeenCalledWith(200)
    expect(json).toHaveBeenCalledWith({ status: "ok" })
  })
})
