import type {
  GeneratedVault,
  VaultAttachment,
  VaultBuilderOptions,
  VaultNote,
} from "../vault.types"

import { buildCover, randomDateBefore, TIMELINE_DAYS, toModifiedTimestamp } from "./builderShared"
import { MOVIES_CORPUS } from "./moviesCorpus"

export const buildMovieNotes = async ({
  endDate,
  random,
}: VaultBuilderOptions): Promise<GeneratedVault> => {
  const notes: VaultNote[] = []
  const attachments: VaultAttachment[] = []

  for (const movie of MOVIES_CORPUS) {
    const created = randomDateBefore(endDate, TIMELINE_DAYS, random)
    const modifiedDate = toModifiedTimestamp(created, random)
    const cover = await buildCover("movie", movie.title, modifiedDate, random, movie.photoKey)
    const frontmatter: VaultNote["frontmatter"] = {
      created,
      type: "movie",
      director: movie.director,
      genre: movie.genre,
      status: movie.status,
    }
    if (movie.status === "watched" && movie.rating) {
      frontmatter.rating = `${String(movie.rating)}/5`
    }
    if (cover.isRealPhoto) {
      frontmatter.source = "pexels"
    }

    notes.push({
      body: `![](${cover.coverPath})\n\n${movie.body}`,
      folder: "library/movies",
      frontmatter,
      modifiedDate,
      title: movie.title,
    })
    attachments.push(cover.attachment)
  }

  return { attachments, notes }
}
