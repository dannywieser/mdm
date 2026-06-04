import { vi } from "vitest"

vi.spyOn(console, "log").mockImplementation(() => {})
vi.spyOn(console, "warn").mockImplementation(() => {})
vi.spyOn(console, "error").mockImplementation(() => {})
vi.spyOn(console, "info").mockImplementation(() => {})
vi.spyOn(console, "debug").mockImplementation(() => {})
vi.spyOn(process.stderr, "write").mockImplementation(() => true)
vi.spyOn(process.stdout, "write").mockImplementation(() => true)

vi.mock("morgan", () => ({
  default: () => (_req: unknown, _res: unknown, next: () => void) => next(),
}))
