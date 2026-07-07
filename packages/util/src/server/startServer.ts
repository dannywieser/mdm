import type { Listenable, StartServerOptions } from "./startServer.types"

const DEFAULT_SHUTDOWN_TIMEOUT_MS = 10_000

/**
 * Starts listening on the given port and registers SIGTERM/SIGINT handlers
 * that stop accepting new connections, run an optional cleanup callback, and
 * exit - forcing the exit if shutdown takes longer than `shutdownTimeoutMs`.
 *
 * @param app An object exposing an Express-compatible `listen` method.
 * @param options Port, service name (used in log messages), logger, and optional shutdown behavior.
 */
export const startServer = (app: Listenable, options: StartServerOptions): void => {
  const {
    logger,
    onShutdown,
    port,
    serviceName,
    shutdownTimeoutMs = DEFAULT_SHUTDOWN_TIMEOUT_MS,
  } = options

  const server = app.listen(port, () => {
    logger.info({ port }, `${serviceName} listening`)
  })

  const shutdown = (signal: string): void => {
    logger.info({ signal }, `Shutting down ${serviceName}`)

    server.close(() => {
      void (onShutdown?.() ?? Promise.resolve())
        .catch((error: unknown) => {
          logger.error({ error }, `Error during ${serviceName} shutdown`)
        })
        .finally(() => {
          // eslint-disable-next-line n/no-process-exit -- this function's entire purpose is to terminate the process once shutdown finishes
          process.exit(0)
        })
    })

    setTimeout(() => {
      // eslint-disable-next-line n/no-process-exit -- force-exit if a connection never drains, so the container doesn't hang until SIGKILL
      process.exit(1)
    }, shutdownTimeoutMs).unref()
  }

  process.on("SIGTERM", () => { shutdown("SIGTERM") })
  process.on("SIGINT", () => { shutdown("SIGINT") })
}
