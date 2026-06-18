export type { ToggleFlagInput, ToggleFlagResult } from "services"

export interface FlagRedisClient {
  get: (key: string) => Promise<string | null>
  set: (
    key: string,
    value: string,
    options?: {
      EX: number
    },
  ) => Promise<unknown>
}

export interface FlagDefinition {
  expiresInDays?: number
}
