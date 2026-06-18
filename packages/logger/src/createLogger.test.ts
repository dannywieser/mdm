import { createLogger } from "./createLogger"

test("returns a logger with the given service name", () => {
  const logger = createLogger("test-service")
  expect(logger.bindings().name).toBe("test-service")
})

test("defaults log level to info", () => {
  const logger = createLogger("test-service")
  expect(logger.level).toBe("info")
})

test("respects LOG_LEVEL env var", () => {
  process.env.LOG_LEVEL = "debug"
  const logger = createLogger("test-service")
  expect(logger.level).toBe("debug")
  delete process.env.LOG_LEVEL
})
