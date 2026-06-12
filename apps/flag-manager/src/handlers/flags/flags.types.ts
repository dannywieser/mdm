export type { ToggleFlagInput, ToggleFlagResult } from "services"

export type FlagRedisClient = {
  get: (key: string) => Promise<string | null>
  set: (
    key: string,
    value: string,
    options?: {
      EX: number
    },
  ) => Promise<unknown>
}

export type FlagDefinition = {
  expiresInDays?: number
}
