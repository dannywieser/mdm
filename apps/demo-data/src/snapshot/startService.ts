import { spawn } from "node:child_process"

import type { RunningService, StartServiceOptions } from "./snapshot.types"

import { waitForHealth } from "./waitForHealth"

/**
 * Spawns one of the existing Express services (notes-api or habit-tracker)
 * against the demo vault and waits until it is ready to serve requests.
 */
export const startService = async ({
  env,
  port,
  serverPath,
}: StartServiceOptions): Promise<RunningService> => {
  const child = spawn(process.execPath, [serverPath], {
    env: { ...process.env, ...env, PORT: String(port) },
    stdio: "ignore",
  })
  const baseUrl = `http://127.0.0.1:${String(port)}`

  try {
    await waitForHealth(`${baseUrl}/health`)
  } catch (error) {
    child.kill()
    throw error
  }

  return {
    baseUrl,
    stop: () => {
      child.kill()
    },
  }
}
