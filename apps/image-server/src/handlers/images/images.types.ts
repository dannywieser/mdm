export interface ImageRedisClient {
  get: (key: string) => Promise<string | null>
  set: (
    key: string,
    value: string,
    options?: { EX: number },
  ) => Promise<unknown>
}

export interface ImageProxyConfig {
  cacheTtlSeconds: number
  imgproxyEnabled: boolean
  imgproxyPathPrefix: string
  imagesRoot: string
  maxWidth: number
  maxHeight: number
}
