import express from "express"
import { toLoggableError } from "mdm-util"
import morgan from "morgan"
import { createClient } from "redis"

import type { FlagDefinition, FlagRedisClient } from "./handlers/flags/flags.types"

import { resolveFlagDefinitions } from "./config"
import { createFlagsHandler } from "./handlers/flags/flags"
import { healthHandler } from "./handlers/health/health"

type RuntimeRedisClient = FlagRedisClient & {
  connect: () => Promise<void>
  on: (event: "error", listener: (error: unknown) => void) => void
}

const createInMemoryClient = (): FlagRedisClient => {
  const store = new Map<string, string>()
  return {
    get: async (key) => store.get(key) ?? null,
    set: async (key, value) => { store.set(key, value) },
  }
}

export const createApp = (
  redisClient: FlagRedisClient,
  flagDefinitions: Record<string, FlagDefinition>,
) => {
  const app = express()

  app.use(morgan("combined"))

  const flagsHandler = createFlagsHandler(redisClient, flagDefinitions)

  app.get("/health", healthHandler)
  app.get("/flags/:id/:flag", flagsHandler)
  app.post("/flags/:id/:flag", flagsHandler)
  app.patch("/flags/:id/:flag", flagsHandler)

  return app
}

export const createRedisClient = (
  redisUrl: string,
): RuntimeRedisClient => {
  const client = createClient({
    url: redisUrl,
  })

  return {
    connect: async () => {
      await client.connect()
    },
    get: async (key) => client.get(key),
    on: (event, listener) => {
      client.on(event, listener)
    },
    set: async (key, value, options) => client.set(key, value, options),
  }
}

const startServer = async (): Promise<void> => {
  const redisEnabled = process.env.REDIS_ENABLED !== "false"
  const port = Number(process.env.PORT ?? 3001)
  const flagDefinitions = await resolveFlagDefinitions()

  let redisClient: FlagRedisClient
  if (redisEnabled) {
    const redisUrl = process.env.REDIS_URL ?? "redis://localhost:6379"
    const client = createRedisClient(redisUrl)
    client.on("error", (error) => {
      console.error("Redis client error", error)
    })
    await client.connect()
    redisClient = client
  } else {
    console.log("Redis disabled — using in-memory store")
    redisClient = createInMemoryClient()
  }

  const app = createApp(redisClient, flagDefinitions)

  app.listen(port, () => {
    console.log(`flag-manager listening on ${port}`)
    console.log("Resolved flag definitions", JSON.stringify(flagDefinitions, null, 2))
  })
}

if (require.main === module) {
  startServer().catch((error: unknown) => {
    console.error(
      "Unable to start flag-manager due to configuration error",
      toLoggableError(error),
    )
    process.exit(1)
  })
}
