import { resolveBearSyncConfig } from "./config"
import { runSync } from "./sync/runSync"

const main = async (): Promise<void> => {
  const config = resolveBearSyncConfig()

  console.info(`[bear-sync] syncing from ${config.bearDbPath} to ${config.notesIngestUrl}`)

  const summary = await runSync(config)

  console.info(
    `[bear-sync] sync complete: ${String(summary.upserted)} upserted, ${String(summary.deleted)} deleted, ${String(summary.unchanged)} unchanged`,
  )
}

main().catch((error: unknown) => {
  console.error("[bear-sync] sync failed", error)
  process.exitCode = 1
})
