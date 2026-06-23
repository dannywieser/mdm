export const WIKILINK_PLACEHOLDER_PATTERN = /WLPH(\d+)ENDWL/g

// eslint-disable-next-line sonarjs/slow-regex -- pattern is bounded by wikilink delimiters; not user-controlled input
export const OBSIDIAN_WIKILINK_EMBED_PATTERN = /!\[\[([^\]|]+)(?:\|[^\]]*)?]]/g

export const normalizeObsidianWikiEmbeds = (markdownBody: string): string =>
  markdownBody.replace(OBSIDIAN_WIKILINK_EMBED_PATTERN, "![]($1)")
