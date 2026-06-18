import type { RequestHandler } from "express"

import { toLoggableError } from "mdm-util"

import type { FlagDefinition, FlagRedisClient } from "./flags.types"

import { getFlag, toggleFlag } from "./flags.util"

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
    const isGetRequest = request.method === "GET"

    if (!(normalizedFlag in flagDefinitions)) {
      response
        .status(400)
        .json({ error: `Flag "${normalizedFlag}" is not configured` })
      return
    }

    const flagDefinition = flagDefinitions[normalizedFlag]

    try {
      const input = {
        id: normalizedId,
        flag: normalizedFlag,
      }
      if (isGetRequest) {
        const result = await getFlag(redisClient, input)
        response.status(200).json(result)
        return
      }

      const result = await toggleFlag(redisClient, input, flagDefinition)
      response.status(200).json(result)
    } catch (error) {
      const errorMessage = isGetRequest
        ? "Unable to retrieve flag"
        : "Unable to toggle flag"

      console.error(errorMessage, toLoggableError(error))
      response.status(500).json({ error: errorMessage })
    }
  }
