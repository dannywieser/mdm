import type {
  GeneratedVault,
  VaultAttachment,
  VaultBuilderOptions,
  VaultNote,
} from "../vault.types"

import { pickMany, pickOne, randomInt } from "../random/random"
import {
  buildCover,
  randomDateBefore,
  TIMELINE_DAYS,
  toModifiedTimestamp,
} from "./builderShared"

const STYLES = [
  "Charred",
  "Smoky",
  "Lemon",
  "Crispy",
  "Slow-Cooked",
  "Garlic",
  "Honey",
  "Spiced",
] as const

const DISHES = [
  "Chickpea Stew",
  "Noodle Bowl",
  "Flatbread",
  "Roast Chicken",
  "Mushroom Risotto",
] as const

const CUISINES = ["italian", "thai", "mexican", "indian", "french", "japanese"] as const

const DIFFICULTIES = ["easy", "medium", "hard"] as const

const INGREDIENTS = [
  "2 tbsp olive oil",
  "1 yellow onion, diced",
  "3 cloves garlic, minced",
  "1 tin crushed tomatoes",
  "1 cup stock",
  "Fresh herbs, torn",
  "Salt and black pepper",
  "1 lemon, zested and juiced",
  "1 tsp smoked paprika",
  "A knob of butter",
] as const

const STEPS = [
  "Heat the oil in a wide pan over medium heat.",
  "Add the aromatics and cook until fragrant.",
  "Build the base and let it reduce slightly.",
  "Add the main ingredients and lower the heat.",
  "Simmer gently, tasting as you go.",
  "Finish with acid and fresh herbs.",
  "Rest for five minutes before serving.",
] as const

export const buildRecipeNotes = ({ endDate, random }: VaultBuilderOptions): GeneratedVault => {
  const notes: VaultNote[] = []
  const attachments: VaultAttachment[] = []
  const titles = STYLES.flatMap((style) => DISHES.map((dish) => `${style} ${dish}`))

  for (const title of titles) {
    const created = randomDateBefore(endDate, TIMELINE_DAYS, random)
    const modifiedDate = toModifiedTimestamp(created, random)
    const cover = buildCover("recipe", title, modifiedDate, random)
    const ingredients = pickMany(random, INGREDIENTS, randomInt(random, 5, 8))
      .map((item) => `- ${item}`)
      .join("\n")
    const steps = pickMany(random, STEPS, randomInt(random, 4, 6))
      .map((step, index) => `${String(index + 1)}. ${step}`)
      .join("\n")

    notes.push({
      body: `![](${cover.coverPath})\n\n## Ingredients\n\n${ingredients}\n\n## Steps\n\n${steps}`,
      folder: "recipes",
      frontmatter: {
        created,
        cuisine: pickOne(random, CUISINES),
        difficulty: pickOne(random, DIFFICULTIES),
        servings: String(randomInt(random, 2, 6)),
      },
      modifiedDate,
      title,
    })
    attachments.push(cover.attachment)
  }

  return { attachments, notes }
}
