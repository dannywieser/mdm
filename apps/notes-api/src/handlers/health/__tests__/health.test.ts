import { healthHandler } from "../health"

describe("healthHandler", () => {
  test("responds with 200 and ok status", () => {
    const json = vi.fn()
    const res = { status: vi.fn().mockReturnValue({ json }) }

    healthHandler({} as never, res as never, vi.fn())

    expect(res.status).toHaveBeenCalledWith(200)
    expect(json).toHaveBeenCalledWith({ status: "ok" })
  })
})
