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

export type ToggleFlagInput = {
  id: string
  flag: string
}

export type ToggleFlagResult = ToggleFlagInput & {
  value: boolean
}

export type FlagDefinition = {
  expiresInSeconds?: number
}
