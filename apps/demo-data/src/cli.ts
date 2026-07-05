import path from "node:path"

import { buildSnapshot } from "./snapshot/buildSnapshot"
import { startService } from "./snapshot/startService"
import { generateVault } from "./vault/generateVault"
import { writeVault } from "./vault/writeVault"

const DEMO_SEED = 1337
const NOTES_API_PORT = 4310
const HABIT_TRACKER_PORT = 4311
const STATS_SERVICE_PORT = 4312

const PACKAGE_ROOT = path.resolve(__dirname, "..")
const VAULT_DIRECTORY = path.join(PACKAGE_ROOT, ".vault")
const APP_CONFIG_PATH = path.join(PACKAGE_ROOT, "app.config.demo.json")
const OUTPUT_DIRECTORY = path.resolve(PACKAGE_ROOT, "../web/public/demo-data")

const main = async (): Promise<void> => {
  const endDate = new Date().toISOString().slice(0, 10)

  console.info(`[demo-data] generating demo vault ending ${endDate}`)
  const vault = generateVault(endDate, DEMO_SEED)
  await writeVault(vault, VAULT_DIRECTORY)
  console.info(
    `[demo-data] wrote ${String(vault.notes.length)} notes and ${String(vault.attachments.length)} attachments to ${VAULT_DIRECTORY}`,
  )

  const serviceEnv = {
    APP_CONFIG_PATH,
    NOTES_ROOT: VAULT_DIRECTORY,
  }
  const notesApi = await startService({
    env: serviceEnv,
    port: NOTES_API_PORT,
    serverPath: require.resolve("notes-api"),
  })
  const habitTracker = await startService({
    env: serviceEnv,
    port: HABIT_TRACKER_PORT,
    serverPath: require.resolve("habit-tracker"),
  })
  const statsService = await startService({
    env: serviceEnv,
    port: STATS_SERVICE_PORT,
    serverPath: require.resolve("stats-service"),
  })

  try {
    const summary = await buildSnapshot({
      attachmentsSourceDirectory: path.join(VAULT_DIRECTORY, "attachments"),
      habitsBaseUrl: habitTracker.baseUrl,
      notesBaseUrl: notesApi.baseUrl,
      outputDirectory: OUTPUT_DIRECTORY,
      statsBaseUrl: statsService.baseUrl,
    })
    console.info(
      `[demo-data] snapshot complete: ${String(summary.viewCount)} views, ${String(summary.habitCount)} habits, ${String(summary.noteCount)} note sources -> ${OUTPUT_DIRECTORY}`,
    )
  } finally {
    notesApi.stop()
    habitTracker.stop()
    statsService.stop()
  }
}

main().catch((error: unknown) => {
  console.error("[demo-data] failed to build demo data", error)
  process.exitCode = 1
})
