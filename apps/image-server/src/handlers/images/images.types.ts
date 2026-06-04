export interface ImageRedisClient {
  get: (key: string) => Promise<string | null>
  set: (key: string, value: string, options?: { EX: number }) => Promise<unknown>
}
