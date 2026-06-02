import { vi } from "vitest"

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
