import { describe, expect, test, vi } from "vitest"

import { findPhotoByKey } from "../../images/pexelsPhotoLibrary"
import { createRandom } from "../../random/random"
import { buildPhotoNotes } from "../photos"
import { PHOTOS_CORPUS } from "../photosCorpus"

const downloadImageMock = vi.hoisted(() => vi.fn().mockResolvedValue(null))

vi.mock("../../images/downloadImage", () => ({
  downloadImage: downloadImageMock,
}))

describe("buildPhotoNotes", () => {
  test("every curated place's photoKey resolves to a real lockfile entry", () => {
    for (const entry of PHOTOS_CORPUS) {
      expect(findPhotoByKey("photos", entry.photoKey)).toBeDefined()
    }
  })

  test("no two curated places share the same photo", () => {
    const photoKeys = PHOTOS_CORPUS.map((entry) => entry.photoKey)
    expect(new Set(photoKeys).size).toBe(photoKeys.length)
  })

  test("builds exactly one note per curated place, pairing each caption with its place", async () => {
    const { notes } = await buildPhotoNotes({ endDate: "2026-07-01", random: createRandom(7) })

    expect(notes).toHaveLength(PHOTOS_CORPUS.length)
    const locations = new Set(notes.map((note) => note.frontmatter.location))
    expect(locations.size).toBe(PHOTOS_CORPUS.length)

    for (const note of notes) {
      const entry = PHOTOS_CORPUS.find((candidate) => candidate.place === note.frontmatter.location)
      expect(entry).toBeDefined()
      expect(note.body).toContain(entry?.caption)
      expect(note.frontmatter.source).toBeUndefined()
    }
  })

  test("marks a photo-journal note's frontmatter source as pexels when its photo downloads successfully", async () => {
    downloadImageMock.mockResolvedValueOnce(Buffer.from("fake-jpeg-bytes"))

    const { notes } = await buildPhotoNotes({ endDate: "2026-07-01", random: createRandom(7) })

    expect(notes[0].frontmatter.source).toBe("pexels")
  })
})
