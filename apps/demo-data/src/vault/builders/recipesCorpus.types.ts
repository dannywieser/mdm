export interface RecipeCorpusEntry {
  title: string
  cuisine: string
  difficulty: "easy" | "medium" | "hard"
  servings: number
  /** Key into the "recipes" Pexels photo pool — a 1:1 match, not a rotation. */
  photoKey: string
  ingredients: readonly string[]
  steps: readonly string[]
  /** Optional bit of voice appended after the steps. */
  note?: string
}
