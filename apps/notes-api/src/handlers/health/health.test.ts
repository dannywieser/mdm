import { healthHandler } from "./health"

describe("healthHandler", () => {
  test("responds with 200 and ok status", () => {
    const json = jest.fn()
    const res = { status: jest.fn().mockReturnValue({ json }) }

    healthHandler({} as never, res as never, jest.fn())

    expect(res.status).toHaveBeenCalledWith(200)
    expect(json).toHaveBeenCalledWith({ status: "ok" })
  })
})
