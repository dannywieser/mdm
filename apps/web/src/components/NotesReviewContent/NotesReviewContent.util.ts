import type { MarkdownNode } from "markdown"

/**
 * True when a note's content already opens with an H1 heading (as Bear notes
 * do, since Bear embeds the title in the note body). In that case the note's
 * title shouldn't also be rendered separately, or it would appear twice.
 */
export const noteContentStartsWithH1 = (content: MarkdownNode | undefined): boolean => {
  const firstChild = content?.children?.[0]

  return firstChild?.type === "heading" && firstChild.depth === 1
}
