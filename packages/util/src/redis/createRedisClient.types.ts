export interface RedisClient {
  connect: () => Promise<void>
  disconnect: () => Promise<void>
  get: (key: string) => Promise<string | null>
  hDel: (key: string, fields: string[]) => Promise<number>
  hGetAll: (key: string) => Promise<Record<string, string>>
  hSet: (key: string, field: string, value: string) => Promise<number>
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
