import { vi } from "vitest"

vi.spyOn(console, "log").mockImplementation(() => {})
vi.spyOn(console, "warn").mockImplementation(() => {})
vi.spyOn(console, "error").mockImplementation(() => {})
vi.spyOn(console, "info").mockImplementation(() => {})

Element.prototype.scrollIntoView = vi.fn()

class ResizeObserverStub {
  observe = vi.fn()
  unobserve = vi.fn()
  disconnect = vi.fn()
}

vi.stubGlobal("ResizeObserver", ResizeObserverStub)

Object.defineProperty(window, "matchMedia", {
  writable: true,
  value: vi.fn((query: string) => ({
    matches: false,
    media: query,
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
  })),
})

vi.mock("../i18n", async () => {
  const actual = await vi.importActual<typeof import("../i18n")>("../i18n")

  return {
    ...actual,
    translate: (key: string) => key,
    useI18n: () => ({
      locale: "en" as const,
      t: (key: string) => key,
    }),
  }
})
