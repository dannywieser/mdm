import { healthHandler } from "./health"

describe("healthHandler", () => {
  test("responds with 200 and ok status", () => {
    const req = {} as never
    const json = jest.fn()
    const res = { status: jest.fn().mockReturnValue({ json }) } as never

    healthHandler(req, res, jest.fn())

    expect(res.status).toHaveBeenCalledWith(200)
    expect(json).toHaveBeenCalledWith({ status: "ok" })
  })
})
