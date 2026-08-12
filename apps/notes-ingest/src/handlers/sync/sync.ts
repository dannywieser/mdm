import type { RequestHandler } from "express"

import { BEAR_NOTES_HASH_KEY } from "markdown"
import { toLoggableError } from "mdm-util"

import type { SyncRedisClient } from "./sync.types"

import { logger } from "../../logger"
import { validateSyncPayload } from "./sync.util"

export const createSyncHandler =
  (redisClient: SyncRedisClient): RequestHandler =>
  async (request, response) => {
    let payload
    try {
      payload = validateSyncPayload(request.body)
    } catch (error) {
      response.status(400).json({
        error: error instanceof Error ? error.message : "Invalid request body",
      })
      return
    }

    try {
      await Promise.all(
        payload.upserts.map((note) =>
          redisClient.hSet(BEAR_NOTES_HASH_KEY, note.id, JSON.stringify(note)),
        ),
      )

      if (payload.deletedIds.length > 0) {
        await redisClient.hDel(BEAR_NOTES_HASH_KEY, payload.deletedIds)
      }

      logger.info(
        { deleted: payload.deletedIds.length, upserted: payload.upserts.length },
        "[sync] applied note sync payload",
      )
      response
        .status(200)
        .json({ deleted: payload.deletedIds.length, upserted: payload.upserts.length })
    } catch (error) {
      logger.error({ error: toLoggableError(error) }, "Unable to apply note sync payload")
      response.status(500).json({ error: "Unable to apply note sync payload" })
    }
  }
