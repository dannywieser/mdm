export interface RedisClient {
  connect: () => Promise<void>
  get: (key: string) => Promise<string | null>
  on: (event: "error", listener: (error: unknown) => void) => void
  ping: () => Promise<void>
  set: (
    key: string,
    value: string,
    options?: {
      EX: number
    },
  ) => Promise<unknown>
}
