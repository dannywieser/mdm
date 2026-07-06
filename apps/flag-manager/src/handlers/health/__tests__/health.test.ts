import { createHealthHandler } from "../health"

describe("createHealthHandler", () => {
  test("responds with 200 when redis responds to ping", async () => {
    const redisClient = { ping: vi.fn().mockResolvedValue(undefined) }
    const json = vi.fn()
    const response = { status: vi.fn().mockReturnValue({ json }) }
    const healthHandler = createHealthHandler(redisClient)

    await healthHandler({} as never, response as never, vi.fn())

    expect(redisClient.ping).toHaveBeenCalled()
    expect(response.status).toHaveBeenCalledWith(200)
    expect(json).toHaveBeenCalledWith({ status: "ok" })
  })

  test("responds with 503 when redis ping fails", async () => {
    const redisClient = {
      ping: vi.fn().mockRejectedValue(new Error("connection closed")),
    }
    const json = vi.fn()
    const response = { status: vi.fn().mockReturnValue({ json }) }
    const healthHandler = createHealthHandler(redisClient)

    await healthHandler({} as never, response as never, vi.fn())

    expect(response.status).toHaveBeenCalledWith(503)
    expect(json).toHaveBeenCalledWith({
      error: "connection closed",
      status: "error",
    })
  })
})
