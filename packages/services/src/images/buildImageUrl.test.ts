import { afterEach, describe, expect, test } from "vitest"

import { setImagesBaseUrl } from "../config"
import { configureDemoMode, resetDemoMode } from "../demo/demoMode"
import { buildImageUrl } from "./buildImageUrl"

afterEach(() => {
  setImagesBaseUrl("")
  resetDemoMode()
})

describe("buildImageUrl", () => {
  test("encodes the image path as a query parameter", () => {
    expect(buildImageUrl({ path: "attachments/cover.jpg" })).toBe(
      `/images?path=${encodeURIComponent("attachments/cover.jpg")}`,
    )
  })

  test("uses the configured images base url", () => {
    setImagesBaseUrl("https://images.example.com")

    expect(buildImageUrl({ path: "cover.jpg" })).toBe(
      "https://images.example.com/images?path=cover.jpg",
    )
  })

  test("maps the path to a static demo file in demo mode", () => {
    configureDemoMode({ dataBasePath: "/demo-data" })

    expect(buildImageUrl({ path: "attachments/covers/books/dune.svg" })).toBe(
      "/demo-data/images/attachments/covers/books/dune.svg",
    )
  })
})
