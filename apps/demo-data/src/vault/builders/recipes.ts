import type {
  GeneratedVault,
  VaultAttachment,
  VaultBuilderOptions,
  VaultNote,
} from "../vault.types"

import { buildCover, randomDateBefore, TIMELINE_DAYS, toModifiedTimestamp } from "./builderShared"
import { RECIPES_CORPUS } from "./recipesCorpus"

const buildBody = (
  ingredients: readonly string[],
  steps: readonly string[],
  note: string | undefined,
  coverPath: string,
): string => {
  const ingredientList = ingredients.map((item) => `- ${item}`).join("\n")
  const stepList = steps.map((step, index) => `${String(index + 1)}. ${step}`).join("\n")
  const noteSection = note ? `\n\n${note}` : ""
  return `![](${coverPath})\n\n## Ingredients\n\n${ingredientList}\n\n## Steps\n\n${stepList}${noteSection}`
}

export const buildRecipeNotes = async ({
  endDate,
  random,
}: VaultBuilderOptions): Promise<GeneratedVault> => {
  const notes: VaultNote[] = []
  const attachments: VaultAttachment[] = []

  for (const recipe of RECIPES_CORPUS) {
    const created = randomDateBefore(endDate, TIMELINE_DAYS, random)
    const modifiedDate = toModifiedTimestamp(created, random)
    const cover = await buildCover("recipe", recipe.title, modifiedDate, random, recipe.photoKey)
    const frontmatter: VaultNote["frontmatter"] = {
      created,
      cuisine: recipe.cuisine,
      difficulty: recipe.difficulty,
      servings: String(recipe.servings),
    }
    if (cover.isRealPhoto) {
      frontmatter.source = "pexels"
    }

    notes.push({
      body: buildBody(recipe.ingredients, recipe.steps, recipe.note, cover.coverPath),
      folder: "recipes",
      frontmatter,
      modifiedDate,
      title: recipe.title,
    })
    attachments.push(cover.attachment)
  }

  return { attachments, notes }
}
