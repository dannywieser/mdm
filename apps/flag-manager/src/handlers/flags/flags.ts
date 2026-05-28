import type { RequestHandler } from "express"

import { toLoggableError } from "mdm-util"

import type { FlagDefinition, FlagRedisClient } from "./flags.types"

import { toggleFlag } from "./flags.util"

const isValidPathValue = (value: unknown): value is string =>
  typeof value === "string" && value.trim().length > 0

export const createFlagsHandler = (
  redisClient: FlagRedisClient,
  flagDefinitions: Record<string, FlagDefinition>,
): RequestHandler =>
  async (request, response) => {
    const { flag, id } = request.params

    if (!isValidPathValue(id) || !isValidPathValue(flag)) {
      response.status(400).json({ error: "Both id and flag path params are required" })
      return
    }

    const normalizedFlag = flag.trim()
    const normalizedId = id.trim()
    const flagDefinition = flagDefinitions[normalizedFlag]

    if (!flagDefinition) {
      response
        .status(400)
        .json({ error: `Flag "${normalizedFlag}" is not configured` })
      return
    }

    try {
      const result = await toggleFlag(redisClient, {
        id: normalizedId,
        flag: normalizedFlag,
      }, flagDefinition)

      response.status(200).json(result)
    } catch (error) {
      console.error("Unable to toggle flag", toLoggableError(error))
      response.status(500).json({ error: "Unable to toggle flag" })
    }
  }
