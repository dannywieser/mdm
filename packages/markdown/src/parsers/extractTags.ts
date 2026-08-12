// Matches inline hashtags the way Bear/Obsidian render them in note bodies:
// `#foo/bar` (simple, `/` nests) or `#multi word tag#` (Bear's closing-hash
// form for tags containing spaces). A `#` only starts a tag when it isn't
// preceded by a word character (so it doesn't fire mid-word, e.g. "C#") and
// is immediately followed by a tag character (so ATX headings, which always
// have a space after their `#`s, never match).
export const TAG_PATTERN =
  /(?<![\p{L}\p{N}_])#([\p{L}\p{N}_][\p{L}\p{N}_ \-/]*[\p{L}\p{N}_\-/])#|(?<![\p{L}\p{N}_])#([\p{L}\p{N}_][\p{L}\p{N}_\-/]*)/gu

const addTag = (tags: string[], seenTags: Set<string>, tag: string): void => {
  if (tag === "" || seenTags.has(tag)) return
  seenTags.add(tag)
  tags.push(tag)
}

// Parses raw markdown text (not the parsed node tree) so tags are available
// as note metadata (for view filters) without paying for a full markdown parse.
// A nested tag like "foo/bar" is expanded into its individual segments
// ("foo", "bar") in addition to the full tag ("foo/bar"), so a view filter
// can match on either the specific leaf or any level of the hierarchy.
export const extractTags = (text: string): string[] => {
  const seenTags = new Set<string>()
  const tags: string[] = []

  for (const match of text.matchAll(TAG_PATTERN)) {
    // TS infers both alternation branches' capture groups as always-present `string`
    // (it doesn't model that the branches are mutually exclusive); only one actually
    // participates in a given match, so the other is `undefined` at runtime.
    const multiWordTag = match[1] as string | undefined
    const simpleTag = match[2] as string | undefined
    const tag = (multiWordTag ?? simpleTag ?? "").trim()

    if (tag === "") continue

    const segments = tag.split("/").filter((segment) => segment !== "")
    for (const segment of segments) addTag(tags, seenTags, segment)
    if (segments.length > 1) addTag(tags, seenTags, tag)
  }

  return tags
}
