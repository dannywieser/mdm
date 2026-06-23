export const WIKILINK_PLACEHOLDER_PATTERN = /WLPH(\d+)ENDWL/g

export const OBSIDIAN_WIKILINK_EMBED_PATTERN = /!\[\[([^\]|]+)(?:\|[^\]]*)?]]/g

export const normalizeObsidianWikiEmbeds = (markdownBody: string): string =>
  markdownBody.replace(OBSIDIAN_WIKILINK_EMBED_PATTERN, "![]($1)")
