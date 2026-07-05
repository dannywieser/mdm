/**
 * Counts whitespace-separated words in a block of text.
 *
 * @param text Text to count words in.
 * @returns Number of words found; returns 0 for empty or whitespace-only text.
 */
export const countWords = (text: string): number => {
  const trimmed = text.trim()
  return trimmed ? trimmed.split(/\s+/).length : 0
}
