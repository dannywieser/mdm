export interface ScannedNotesRedisClient {
  hGetAll: (key: string) => Promise<Record<string, string>>
}
