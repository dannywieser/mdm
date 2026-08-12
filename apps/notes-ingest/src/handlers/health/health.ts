import type { RequestHandler } from "express"

export interface HealthRedisClient {
  ping: () => Promise<void>
}

export const createHealthHandler =
  (redisClient: HealthRedisClient): RequestHandler =>
  async (_request, response) => {
    try {
      await redisClient.ping()

      response.status(200).json({ status: "ok" })
    } catch (error) {
      response.status(503).json({
        error: error instanceof Error ? error.message : "Unknown error",
        status: "error",
      })
    }
  }
