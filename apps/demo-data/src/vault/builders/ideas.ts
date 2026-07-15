import type { DemoFrontmatter, VaultBuilderOptions, VaultNote } from "../vault.types"

import { randomDateBefore, TIMELINE_DAYS, toModifiedTimestamp } from "./builderShared"
import { IDEAS_CORPUS } from "./ideasCorpus"

const buildBody = (pitch: string, openQuestions: readonly string[]): string => {
  const questions = openQuestions.map((question) => `- ${question}`).join("\n")
  return `${pitch}\n\n## Open questions\n\n${questions}`
}

/** Builds idea notes; a few are archived to exercise `$missing` filters. */
export const buildIdeaNotes = ({ endDate, random }: VaultBuilderOptions): VaultNote[] =>
  IDEAS_CORPUS.map((idea) => {
    const created = randomDateBefore(endDate, TIMELINE_DAYS, random)
    const frontmatter: DemoFrontmatter = {
      created,
      tags: [...idea.tags],
    }
    if (idea.archived) {
      frontmatter.archived = "true"
    }

    return {
      body: buildBody(idea.pitch, idea.openQuestions),
      folder: "ideas",
      frontmatter,
      modifiedDate: toModifiedTimestamp(created, random),
      title: idea.title,
    }
  })
