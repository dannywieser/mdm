import { createClient } from "redis"

import { createRedisClient } from "../createRedisClient"

vi.mock("redis", () => ({
  createClient: vi.fn(),
}))

describe("createRedisClient", () => {
  const mockClient = {
    connect: vi.fn(),
    get: vi.fn(),
    on: vi.fn(),
    ping: vi.fn(),
    set: vi.fn(),
  }

  beforeEach(() => {
    vi.mocked(createClient).mockReturnValue(mockClient as never)
  })

  test("creates a client using the provided url", () => {
    createRedisClient("redis://localhost:6379")

    expect(createClient).toHaveBeenCalledWith({ url: "redis://localhost:6379" })
  })

  test("connect delegates to the underlying client", async () => {
    const client = createRedisClient("redis://localhost:6379")

    await client.connect()

    expect(mockClient.connect).toHaveBeenCalled()
  })

  test("get delegates to the underlying client", async () => {
    mockClient.get.mockResolvedValue("value")

    const client = createRedisClient("redis://localhost:6379")
    const result = await client.get("key")

    expect(mockClient.get).toHaveBeenCalledWith("key")
    expect(result).toBe("value")
  })

  test("set delegates to the underlying client", async () => {
    const client = createRedisClient("redis://localhost:6379")

    await client.set("key", "value", { EX: 60 })

    expect(mockClient.set).toHaveBeenCalledWith("key", "value", { EX: 60 })
  })

  test("on registers an error listener with the underlying client", () => {
    const client = createRedisClient("redis://localhost:6379")
    const listener = vi.fn()

    client.on("error", listener)

    expect(mockClient.on).toHaveBeenCalledWith("error", listener)
  })

  test("ping delegates to the underlying client", async () => {
    const client = createRedisClient("redis://localhost:6379")

    await client.ping()

    expect(mockClient.ping).toHaveBeenCalled()
  })

  test("ping rejects when the underlying client rejects", async () => {
    mockClient.ping.mockRejectedValue(new Error("connection closed"))
    const client = createRedisClient("redis://localhost:6379")

    await expect(client.ping()).rejects.toThrow("connection closed")
  })
})
