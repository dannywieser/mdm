import type { VaultBuilderOptions, VaultNote } from "../vault.types"

import { randomDateBefore, TIMELINE_DAYS, toModifiedTimestamp } from "./builderShared"
import { QUOTES_CORPUS } from "./quotesCorpus"

/** Builds short quote notes for the NotesReview reading flow. */
export const buildQuoteNotes = ({ endDate, random }: VaultBuilderOptions): VaultNote[] =>
  QUOTES_CORPUS.map((quote, index) => {
    const created = randomDateBefore(endDate, TIMELINE_DAYS, random)

    return {
      body: `> ${quote.text}\n\n${quote.reflection}`,
      folder: "quotes",
      frontmatter: {
        created,
        author: quote.author,
        source: quote.source,
        tags: [...quote.tags],
      },
      modifiedDate: toModifiedTimestamp(created, random),
      title: `Quote ${String(index + 1).padStart(3, "0")}`,
    }
  })
