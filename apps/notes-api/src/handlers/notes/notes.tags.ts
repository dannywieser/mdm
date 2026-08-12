import { TAG_PATTERN } from "markdown"

export const TAG_PLACEHOLDER_PATTERN = /TGPH(\d+)ENDTG/g

/**
 * Replaces every inline `#tag`/`#multi word tag#` occurrence in raw markdown
 * text with a placeholder token, before the body is handed to remark. Doing
 * the replacement pre-parse (rather than trying to detect tags in the
 * resulting AST) keeps markdown's own inline parsing rules for surrounding
 * text intact, mirroring how wikilinks are resolved.
 */
export const injectTagPlaceholders = (
  body: string,
): { processedBody: string; tagValues: string[] } => {
  const tagValues: string[] = []

  const processedBody = body.replace(
    TAG_PATTERN,
    (_, multiWordTag: string | undefined, simpleTag: string | undefined) => {
      const index = tagValues.length
      tagValues.push((multiWordTag ?? simpleTag ?? "").trim())
      return `TGPH${index}ENDTG`
    },
  )

  return { processedBody, tagValues }
}
