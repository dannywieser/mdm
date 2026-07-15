import type {
  GeneratedVault,
  VaultAttachment,
  VaultBuilderOptions,
  VaultNote,
} from "../vault.types"

import { BOOKS_CORPUS } from "./booksCorpus"
import { buildCover, randomDateBefore, TIMELINE_DAYS, toModifiedTimestamp } from "./builderShared"

export const BOOK_TITLES: readonly string[] = BOOKS_CORPUS.map((book) => book.title)

export const buildBookNotes = async ({
  endDate,
  random,
}: VaultBuilderOptions): Promise<GeneratedVault> => {
  const notes: VaultNote[] = []
  const attachments: VaultAttachment[] = []

  for (const book of BOOKS_CORPUS) {
    const created = randomDateBefore(endDate, TIMELINE_DAYS, random)
    const modifiedDate = toModifiedTimestamp(created, random)
    const cover = await buildCover("book", book.title, modifiedDate, random, book.photoKey)
    const frontmatter: VaultNote["frontmatter"] = {
      created,
      type: "book",
      author: book.author,
      genre: book.genre,
      status: book.status,
    }
    if (book.status === "read" && book.rating) {
      frontmatter.rating = `${String(book.rating)}/5`
    }
    if (cover.isRealPhoto) {
      frontmatter.source = "pexels"
    }

    notes.push({
      body: `![](${cover.coverPath})\n\n${book.body}`,
      folder: "library/books",
      frontmatter,
      modifiedDate,
      title: book.title,
    })
    attachments.push(cover.attachment)
  }

  return { attachments, notes }
}
