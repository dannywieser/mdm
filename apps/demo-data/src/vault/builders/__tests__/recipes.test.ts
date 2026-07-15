import { describe, expect, test, vi } from "vitest"

import { findPhotoByKey } from "../../images/pexelsPhotoLibrary"
import { buildRecipeNotes } from "../recipes"
import { RECIPES_CORPUS } from "../recipesCorpus"

const downloadImage = vi.hoisted(() => vi.fn<(url: string) => Promise<Buffer | null>>())
vi.mock("../../images/downloadImage", () => ({ downloadImage }))

describe("buildRecipeNotes", () => {
  test("every curated recipe's photoKey resolves to a real lockfile entry", () => {
    for (const recipe of RECIPES_CORPUS) {
      expect(findPhotoByKey("recipes", recipe.photoKey)).toBeDefined()
    }
  })

  test("builds one note per curated recipe with its own matching photo", async () => {
    downloadImage.mockResolvedValue(Buffer.from([1, 2, 3]))

    const { notes } = await buildRecipeNotes({ endDate: "2026-07-01", random: () => 0.5 })

    expect(notes).toHaveLength(RECIPES_CORPUS.length)
    for (const [index, note] of notes.entries()) {
      const recipe = RECIPES_CORPUS[index]
      expect(note.title).toBe(recipe.title)
      expect(note.frontmatter.cuisine).toBe(recipe.cuisine)
      expect(note.frontmatter.servings).toBe(String(recipe.servings))
      expect(note.frontmatter.source).toBe("pexels")
      expect(note.body).toMatch(/\.jpg\)/)
      for (const ingredient of recipe.ingredients) {
        expect(note.body).toContain(ingredient)
      }
    }
  })

  test("falls back to a generated SVG cover when the photo download fails", async () => {
    downloadImage.mockResolvedValue(null)

    const { notes } = await buildRecipeNotes({ endDate: "2026-07-01", random: () => 0.5 })

    expect(notes[0]?.body).toMatch(/\.svg\)/)
    expect(notes[0]?.frontmatter.source).toBeUndefined()
  })
})
