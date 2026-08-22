/**
 * Trims leading and trailing slashes without a regex, so a configured folder
 * can be written as `finance`, `/finance` or `finance/` interchangeably.
 */
const trimSlashes = (value: string): string => {
  let start = 0
  let end = value.length
  while (start < end && value[start] === "/") start += 1
  while (end > start && value[end - 1] === "/") end -= 1
  return value.slice(start, end)
}

/**
 * Decides whether a vault-relative path belongs to the configured
 * transactions folder. An empty `folder` accepts everything; otherwise the
 * path must be that folder or sit inside it — a sibling that merely shares
 * the folder's name as a prefix (`financial` vs `finance`) does not match.
 */
export const isInFolder = (relativePath: string, folder: string): boolean => {
  const normalizedFolder = trimSlashes(folder)
  if (normalizedFolder === "") return true
  return relativePath === normalizedFolder || relativePath.startsWith(`${normalizedFolder}/`)
}
