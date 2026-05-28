import type { RequestHandler } from "express"

import { toLoggableError } from "mdm-util"

import type { FlagRedisClient } from "./flags.types"

import { toggleFlag } from "./flags.util"

const isValidPathValue = (value: unknown): value is string =>
  typeof value === "string" && value.trim().length > 0

export const createFlagsHandler = (redisClient: FlagRedisClient): RequestHandler =>
  async (request, response) => {
    const { flag, id } = request.params

    if (!isValidPathValue(id) || !isValidPathValue(flag)) {
      response.status(400).json({ error: "Both id and flag path params are required" })
      return
    }

    try {
      const result = await toggleFlag(redisClient, {
        id: id.trim(),
        flag: flag.trim(),
      })

      response.status(200).json(result)
    } catch (error) {
      console.error("Unable to toggle flag", toLoggableError(error))
      response.status(500).json({ error: "Unable to toggle flag" })
    }
  }
