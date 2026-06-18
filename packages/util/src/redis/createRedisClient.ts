import { createClient } from "redis"

import type { RedisClient } from "./createRedisClient.types"

/**
 * Creates a Redis client wrapper with the connect/get/set/on surface shared
 * across services that cache values in Redis.
 *
 * @param redisUrl Connection URL passed to the underlying Redis client.
 * @returns A Redis client exposing connect, get, set, and on.
 */
export const createRedisClient = (redisUrl: string): RedisClient => {
  const client = createClient({ url: redisUrl })

  return {
    connect: async () => {
      await client.connect()
    },
    get: async (key) => {
      const value = await client.get(key)

      return value
    },
    on: (event, listener) => {
      client.on(event, listener)
    },
    set: async (key, value, options) => client.set(key, value, options),
  }
}
