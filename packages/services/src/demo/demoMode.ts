import type { ConfigureDemoModeOptions } from "./demoMode.types"

let demoDataBasePath: string | null = null

/**
 * Enables demo mode: query hooks read pre-built static JSON files from
 * `dataBasePath` instead of calling the live services, and flag state is
 * kept in browser session storage instead of the redis-backed flag-manager.
 */
export const configureDemoMode = ({ dataBasePath }: ConfigureDemoModeOptions): void => {
  let normalized = dataBasePath
  while (normalized.endsWith("/")) {
    normalized = normalized.slice(0, -1)
  }
  demoDataBasePath = normalized
}

export const isDemoMode = (): boolean => demoDataBasePath !== null

export const getDemoDataBasePath = (): string => {
  if (demoDataBasePath === null) {
    throw new Error("Demo mode is not configured")
  }
  return demoDataBasePath
}

/** Disables demo mode again; intended for tests. */
export const resetDemoMode = (): void => {
  demoDataBasePath = null
}
