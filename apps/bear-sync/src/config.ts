import { isNonEmptyString } from "mdm-util"
import os from "node:os"
import path from "node:path"

import type { BearSyncConfig } from "./config.types"

const DEFAULT_BEAR_DB_PATH = path.join(
  os.homedir(),
  "Library/Group Containers/9K33E3U3T4.net.shinyfrog.bear/Application Data/database.sqlite",
)
const DEFAULT_SYNC_STATE_PATH = path.join(os.homedir(), ".mdm-bear-sync", "state.json")

export const resolveBearSyncConfig = (env: NodeJS.ProcessEnv = process.env): BearSyncConfig => {
  const notesIngestUrl = env.NOTES_INGEST_URL?.trim()

  if (!isNonEmptyString(notesIngestUrl)) {
    throw new Error("NOTES_INGEST_URL environment variable is required")
  }

  const dateFormats =
    env.BEAR_DATE_FORMATS?.split(",")
      .map((format) => format.trim())
      .filter(isNonEmptyString) ?? []

  const bearDbPath = env.BEAR_DB_PATH?.trim()
  const syncStatePath = env.SYNC_STATE_PATH?.trim()

  return {
    bearDbPath: isNonEmptyString(bearDbPath) ? bearDbPath : DEFAULT_BEAR_DB_PATH,
    dateFormats,
    notesIngestUrl,
    syncStatePath: isNonEmptyString(syncStatePath) ? syncStatePath : DEFAULT_SYNC_STATE_PATH,
  }
}
