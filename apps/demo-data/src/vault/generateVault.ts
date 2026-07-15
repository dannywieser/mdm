import type { GeneratedVault } from "./vault.types"

import { buildBookNotes } from "./builders/books"
import { buildIdeaNotes } from "./builders/ideas"
import { buildJournalNotes } from "./builders/journal"
import { buildMovieNotes } from "./builders/movies"
import { buildPeopleNotes } from "./builders/people"
import { buildPhotoNotes } from "./builders/photos"
import { buildProjectNotes } from "./builders/projects"
import { buildQuoteNotes } from "./builders/quotes"
import { buildRecipeNotes } from "./builders/recipes"
import { createRandom } from "./random/random"

/**
 * Generates the full demo vault: a multi-year journal plus photo, library,
 * quotes, ideas, projects, recipes, and people notes. Deterministic for a
 * given seed and end date.
 */
export const generateVault = async (endDate: string, seed: number): Promise<GeneratedVault> => {
  const random = createRandom(seed)
  const options = { endDate, random }

  const books = await buildBookNotes(options)
  const movies = await buildMovieNotes(options)
  const photos = await buildPhotoNotes(options)
  const recipes = await buildRecipeNotes(options)

  return {
    attachments: [
      ...books.attachments,
      ...movies.attachments,
      ...photos.attachments,
      ...recipes.attachments,
    ],
    notes: [
      ...buildJournalNotes(options),
      ...photos.notes,
      ...books.notes,
      ...movies.notes,
      ...buildQuoteNotes(options),
      ...buildIdeaNotes(options),
      ...buildProjectNotes(options),
      ...recipes.notes,
      ...buildPeopleNotes(options),
    ],
  }
}
