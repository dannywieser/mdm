import { createClient } from "redis"

import { createRedisClient } from "../createRedisClient"

vi.mock("redis", () => ({
  createClient: vi.fn(),
}))

describe("createRedisClient", () => {
  const mockClient = {
    close: vi.fn(),
    connect: vi.fn(),
    get: vi.fn(),
    hDel: vi.fn(),
    hGetAll: vi.fn(),
    hSet: vi.fn(),
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

  test("hSet delegates to the underlying client", async () => {
    mockClient.hSet.mockResolvedValue(1)

    const client = createRedisClient("redis://localhost:6379")
    const result = await client.hSet("key", "field", "value")

    expect(mockClient.hSet).toHaveBeenCalledWith("key", "field", "value")
    expect(result).toBe(1)
  })

  test("hGetAll delegates to the underlying client", async () => {
    mockClient.hGetAll.mockResolvedValue({ field: "value" })

    const client = createRedisClient("redis://localhost:6379")
    const result = await client.hGetAll("key")

    expect(mockClient.hGetAll).toHaveBeenCalledWith("key")
    expect(result).toEqual({ field: "value" })
  })

  test("hDel delegates to the underlying client", async () => {
    mockClient.hDel.mockResolvedValue(2)

    const client = createRedisClient("redis://localhost:6379")
    const result = await client.hDel("key", ["field1", "field2"])

    expect(mockClient.hDel).toHaveBeenCalledWith("key", ["field1", "field2"])
    expect(result).toBe(2)
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

  test("disconnect delegates to the underlying client's close", async () => {
    const client = createRedisClient("redis://localhost:6379")

    await client.disconnect()

    expect(mockClient.close).toHaveBeenCalled()
  })
})
