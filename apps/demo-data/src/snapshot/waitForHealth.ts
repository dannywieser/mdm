import type { WaitForHealthOptions } from "./snapshot.types"

const DEFAULT_ATTEMPTS = 60
const DEFAULT_DELAY_MS = 250

const sleep = (durationMs: number): Promise<void> =>
  new Promise((resolve) => setTimeout(resolve, durationMs))

/** Polls a health endpoint until it responds OK, or fails after `attempts`. */
export const waitForHealth = async (
  healthUrl: string,
  { attempts = DEFAULT_ATTEMPTS, delayMs = DEFAULT_DELAY_MS }: WaitForHealthOptions = {},
): Promise<void> => {
  for (let attempt = 0; attempt < attempts; attempt += 1) {
    try {
      const response = await fetch(healthUrl)
      if (response.ok) {
        return
      }
    } catch {
      // Service not accepting connections yet; retry below.
    }
    await sleep(delayMs)
  }

  throw new Error(`Service did not become healthy: ${healthUrl}`)
}
