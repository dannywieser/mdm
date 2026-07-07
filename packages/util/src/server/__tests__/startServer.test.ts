import type { MockInstance } from "vitest"

import { startServer } from "../startServer"

type SignalHandler = () => void

describe("startServer", () => {
  let listeners: Record<string, SignalHandler>
  let exitSpy: MockInstance<typeof process.exit>

  const createMockApp = (closeImpl: (callback: () => void) => void = (callback) => { callback() }) => ({
    listen: vi.fn().mockImplementation((_port: number, callback: () => void) => {
      callback()

      return { close: vi.fn().mockImplementation(closeImpl) }
    }),
  })

  const createMockLogger = () => ({ error: vi.fn(), info: vi.fn() })

  beforeEach(() => {
    listeners = {}
    vi.spyOn(process, "on").mockImplementation((event, handler) => {
      listeners[event as string] = handler as SignalHandler

      return process
    })
    exitSpy = vi.spyOn(process, "exit").mockImplementation(() => undefined as never)
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  test("listens on the given port and logs on start", () => {
    const logger = createMockLogger()
    const app = createMockApp()

    startServer(app, { logger, port: 3000, serviceName: "notes-api" })

    expect(app.listen).toHaveBeenCalledWith(3000, expect.any(Function))
    expect(logger.info).toHaveBeenCalledWith({ port: 3000 }, "notes-api listening")
  })

  test("registers SIGTERM and SIGINT handlers", () => {
    const logger = createMockLogger()
    const app = createMockApp()

    startServer(app, { logger, port: 3000, serviceName: "notes-api" })

    expect(listeners.SIGTERM).toBeInstanceOf(Function)
    expect(listeners.SIGINT).toBeInstanceOf(Function)
  })

  test("closes the server and exits 0 on SIGTERM", async () => {
    const logger = createMockLogger()
    const app = createMockApp()

    startServer(app, { logger, port: 3000, serviceName: "notes-api" })
    listeners.SIGTERM()

    await vi.waitFor(() => { expect(exitSpy).toHaveBeenCalledWith(0) })
  })

  test("runs onShutdown before exiting", async () => {
    const logger = createMockLogger()
    const app = createMockApp()
    const onShutdown = vi.fn().mockResolvedValue(undefined)

    startServer(app, { logger, onShutdown, port: 3000, serviceName: "notes-api" })
    listeners.SIGINT()

    await vi.waitFor(() => { expect(exitSpy).toHaveBeenCalledWith(0) })
    expect(onShutdown).toHaveBeenCalled()
  })

  test("logs and still exits 0 when onShutdown rejects", async () => {
    const logger = createMockLogger()
    const app = createMockApp()
    const error = new Error("cleanup failed")
    const onShutdown = vi.fn().mockRejectedValue(error)

    startServer(app, { logger, onShutdown, port: 3000, serviceName: "notes-api" })
    listeners.SIGTERM()

    await vi.waitFor(() => { expect(exitSpy).toHaveBeenCalledWith(0) })
    expect(logger.error).toHaveBeenCalledWith(
      { error },
      "Error during notes-api shutdown",
    )
  })

  test("force-exits with code 1 if shutdown exceeds the timeout", () => {
    vi.useFakeTimers()
    const logger = createMockLogger()
    // server.close never invokes its callback, simulating a hung connection
    const app = createMockApp(() => undefined)

    startServer(app, {
      logger,
      port: 3000,
      serviceName: "notes-api",
      shutdownTimeoutMs: 5000,
    })
    listeners.SIGTERM()
    vi.advanceTimersByTime(5000)

    expect(exitSpy).toHaveBeenCalledWith(1)
  })
})
