import { describe, expect, test, vi } from "vitest"

import { findPhotoByKey } from "../../images/pexelsPhotoLibrary"
import { buildMovieNotes } from "../movies"
import { MOVIES_CORPUS } from "../moviesCorpus"

const downloadImageMock = vi.hoisted(() => vi.fn().mockResolvedValue(null))

vi.mock("../../images/downloadImage", () => ({
  downloadImage: downloadImageMock,
}))

describe("buildMovieNotes", () => {
  test("every curated movie's photoKey resolves to a real, distinct lockfile entry", () => {
    const photoKeys = MOVIES_CORPUS.map((movie) => movie.photoKey)
    for (const key of photoKeys) {
      expect(findPhotoByKey("movies", key)).toBeDefined()
    }
    expect(new Set(photoKeys).size).toBe(photoKeys.length)
  })

  test("builds one note per curated movie, only rating watched entries", async () => {
    const { notes } = await buildMovieNotes({ endDate: "2026-07-01", random: () => 0.5 })

    expect(notes).toHaveLength(MOVIES_CORPUS.length)
    for (const [index, note] of notes.entries()) {
      const movie = MOVIES_CORPUS[index]
      expect(note.title).toBe(movie.title)
      expect(note.frontmatter.director).toBe(movie.director)
      expect(note.frontmatter.status).toBe(movie.status)
      if (movie.status === "watched" && movie.rating) {
        expect(note.frontmatter.rating).toBe(`${String(movie.rating)}/5`)
      } else {
        expect(note.frontmatter.rating).toBeUndefined()
      }
      expect(note.frontmatter.source).toBeUndefined()
    }
  })

  test("marks a movie's frontmatter source as pexels when its photo downloads successfully", async () => {
    downloadImageMock.mockResolvedValueOnce(Buffer.from("fake-jpeg-bytes"))

    const { notes } = await buildMovieNotes({ endDate: "2026-07-01", random: () => 0.5 })

    expect(notes[0].frontmatter.source).toBe("pexels")
  })
})
