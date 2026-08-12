import { createClient } from "redis"

import type { RedisClient } from "./createRedisClient.types"

/**
 * Creates a Redis client wrapper with the connect/disconnect/get/set/hSet/
 * hGetAll/hDel/on/ping surface shared across services that cache or store
 * values in Redis.
 *
 * @param redisUrl Connection URL passed to the underlying Redis client.
 * @returns A Redis client exposing connect, disconnect, get, set, hSet,
 * hGetAll, hDel, on, and ping.
 */
export const createRedisClient = (redisUrl: string): RedisClient => {
  const client = createClient({ url: redisUrl })

  return {
    connect: async () => {
      await client.connect()
    },
    disconnect: async () => {
      await client.close()
    },
    get: async (key) => {
      const value = await client.get(key)

      return value
    },
    hDel: async (key, fields) => client.hDel(key, fields),
    hGetAll: async (key) => client.hGetAll(key),
    hSet: async (key, field, value) => client.hSet(key, field, value),
    on: (event, listener) => {
      client.on(event, listener)
    },
    ping: async () => {
      await client.ping()
    },
    set: async (key, value, options) => client.set(key, value, options),
  }
}
