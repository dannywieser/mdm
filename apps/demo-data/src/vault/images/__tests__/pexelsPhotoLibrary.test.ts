import { describe, expect, test } from "vitest"

import { findPhotoByKey, getPhotoPool } from "../pexelsPhotoLibrary"

describe("getPhotoPool", () => {
  test("returns the curated photos for a known category", () => {
    const pool = getPhotoPool("recipes")

    expect(pool.length).toBeGreaterThan(0)
    for (const photo of pool) {
      expect(photo.src).toMatch(/^https:\/\/images\.pexels\.com\//)
    }
  })
})

describe("findPhotoByKey", () => {
  test("finds a curated photo by its stable key", () => {
    const photo = findPhotoByKey("recipes", "dutch-baby")

    expect(photo?.key).toBe("dutch-baby")
  })

  test("returns undefined for an unknown key", () => {
    expect(findPhotoByKey("recipes", "does-not-exist")).toBeUndefined()
  })
})
