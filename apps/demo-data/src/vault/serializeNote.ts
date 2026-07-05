import type { DemoFrontmatter, VaultNote } from "./vault.types"

const serializeFrontmatterValue = (key: string, value: string | string[]): string[] => {
  if (Array.isArray(value)) {
    return [`${key}:`, ...value.map((entry) => `  - ${entry}`)]
  }
  return [`${key}: ${value}`]
}

/** Serializes frontmatter into the "---" delimited block Obsidian uses. */
export const serializeFrontmatter = (frontmatter: DemoFrontmatter): string => {
  const lines = Object.entries(frontmatter).flatMap(([key, value]) =>
    serializeFrontmatterValue(key, value),
  )
  return ["---", ...lines, "---"].join("\n")
}

/** Serializes a demo note into full markdown file contents. */
export const serializeNote = (note: VaultNote): string =>
  `${serializeFrontmatter(note.frontmatter)}\n\n${note.body}\n`
