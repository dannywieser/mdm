import { describe, expect, test, vi } from "vitest"

import { findPhotoByKey } from "../../images/pexelsPhotoLibrary"
import { buildBookNotes } from "../books"
import { BOOKS_CORPUS } from "../booksCorpus"

const downloadImageMock = vi.hoisted(() => vi.fn().mockResolvedValue(null))

vi.mock("../../images/downloadImage", () => ({
  downloadImage: downloadImageMock,
}))

describe("buildBookNotes", () => {
  test("every curated book's photoKey resolves to a real, distinct lockfile entry", () => {
    const photoKeys = BOOKS_CORPUS.map((book) => book.photoKey)
    for (const key of photoKeys) {
      expect(findPhotoByKey("books", key)).toBeDefined()
    }
    expect(new Set(photoKeys).size).toBe(photoKeys.length)
  })

  test("builds one note per curated book, embedding its cover and body", async () => {
    const { attachments, notes } = await buildBookNotes({
      endDate: "2026-07-01",
      random: () => 0.5,
    })

    expect(notes).toHaveLength(BOOKS_CORPUS.length)
    expect(attachments).toHaveLength(BOOKS_CORPUS.length)
    for (const [index, note] of notes.entries()) {
      const book = BOOKS_CORPUS[index]
      expect(note.title).toBe(book.title)
      expect(note.folder).toBe("library/books")
      expect(note.body).toContain(book.body)
      expect(note.frontmatter.author).toBe(book.author)
      expect(note.frontmatter.status).toBe(book.status)
      expect(note.frontmatter.source).toBeUndefined()
    }
  })

  test("marks a book's frontmatter source as pexels when its photo downloads successfully", async () => {
    downloadImageMock.mockResolvedValueOnce(Buffer.from("fake-jpeg-bytes"))

    const { notes } = await buildBookNotes({ endDate: "2026-07-01", random: () => 0.5 })

    expect(notes[0].frontmatter.source).toBe("pexels")
  })

  test("only attaches a rating when the book is marked read", async () => {
    const { notes } = await buildBookNotes({ endDate: "2026-07-01", random: () => 0.5 })

    for (const [index, note] of notes.entries()) {
      const book = BOOKS_CORPUS[index]
      if (book.status === "read" && book.rating) {
        expect(note.frontmatter.rating).toBe(`${String(book.rating)}/5`)
      } else {
        expect(note.frontmatter.rating).toBeUndefined()
      }
    }
  })
})
