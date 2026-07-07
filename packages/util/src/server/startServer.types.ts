import type { Server } from "node:http"

export interface Listenable {
  listen: (port: number, callback: () => void) => Server
}

export interface MinimalLogger {
  error: (fields: Record<string, unknown>, message: string) => void
  info: (fields: Record<string, unknown>, message: string) => void
}

export interface StartServerOptions {
  logger: MinimalLogger
  onShutdown?: () => Promise<void>
  port: number
  serviceName: string
  shutdownTimeoutMs?: number
}
