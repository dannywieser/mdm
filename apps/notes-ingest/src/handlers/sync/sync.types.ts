export interface SyncRedisClient {
  hDel: (key: string, fields: string[]) => Promise<number>
  hSet: (key: string, field: string, value: string) => Promise<number>
}
