# markdown

Low-level parsing utilities for Obsidian-flavored markdown notes: YAML-ish frontmatter parsing, date extraction from note text, and vault file collection. Owns the `Note` type used across the codebase, and the `ScannedNote`/`NoteSyncPayload` shapes shared between `notes-api`, `notes-ingest`, and `bear-sync` for the Bear note source. Depends only on `mdm-util`.

## Usage

```ts
import { collectMarkdownFiles, parseFrontMatter, parseMarkdownBodyDates, extractNoteDates, resolveDateFromFrontmatterOrTitle, resolveOldestDate, buildObsidianUrl, parseDateString, extractImagePaths, extractTags, TAG_PATTERN, BEAR_NOTES_HASH_KEY } from "markdown"
import type { Note, NoteFrontmatter, MarkdownNode, ScannedNote, NoteSyncPayload } from "markdown"
```

- `ScannedNote` (`Omit<Note, "content">`) is a note with frontmatter/dates/metadata parsed but before the expensive markdown AST parse + wikilink resolution step — the shape both the Obsidian file-scan path and the Bear sync path produce.
- `NoteSyncPayload` (`{ upserts: ScannedNote[], deletedIds: string[] }`) is the request body `notes-ingest`'s `POST /notes/sync` accepts.
- `BEAR_NOTES_HASH_KEY` is the Redis hash key `notes-ingest` writes Bear-sourced notes to and `notes-api`'s Bear note source reads from — kept here as the one shared constant so the two services can't drift on it independently.

## Structure

- `files/collectMarkdownFiles.ts` — recursively collects absolute paths of every `.md`/`.markdown` file under a directory.
- `files/buildObsidianUrl.ts` — builds an `obsidian://open` deep link for a file relative to the vault root.
- `parsers/parseFrontMatter.ts` — splits a raw file's `---`-delimited YAML frontmatter block from its body, resolving Obsidian `[[wikilink]]`/`[[wikilink|alias]]` frontmatter values to their plain target string.
- `parsers/parseMarkdownBodyDates.ts` — scans arbitrary text for every substring matching a set of tokenized date formats (`YYYY`, `YY`, `MM`, `DD`), returning matches in the order first found.
- `parsers/parseDateString.ts` — parses a single string against a set of date formats into a `Date`.
- `parsers/extractImagePaths.ts` — scans raw markdown text (not the parsed node tree) for every image, matching either standard `![alt](path)` syntax (including `<path>`-bracketed and titled destinations) or an Obsidian `![[path]]`/`![[path|alias]]` embed, and returns each raw path in document order, deduplicated.
- `parsers/extractTags.ts` — scans raw markdown text for inline hashtags the way Bear/Obsidian render them: `#foo/bar` (simple, `/` nests) or `#multi word tag#` (Bear's closing-hash form for tags containing spaces). A nested tag is expanded into its individual segments in addition to the full tag — `#foo/bar` yields `"foo"`, `"bar"`, and `"foo/bar"` — so hierarchy-aware filtering can match on any level. Returns tags in document order, deduplicated. Also exports `TAG_PATTERN`, the underlying regex, so callers that need to locate (not just list) tags — like `notes-api`'s inline tag-node rendering, which keeps the full unsplit tag — can reuse the same matching rules.
- `dates/extractNoteDates.ts` — extracts every date found across a note's title and full raw source (frontmatter + body) in one pass, deduplicated.
- `dates/resolveDateFromFrontmatterOrTitle.ts` — resolves a note's date from a configured frontmatter property, falling back to a date embedded in the title.
- `dates/resolveOldestDate.ts` — resolves the earliest of a list of date strings, parsing each against the configured formats and then as ISO 8601.
- `types.ts` — `Note`, `NoteFrontmatter`, `FrontmatterValue`, `MarkdownNode`, `ParsedFrontMatter`, `ParsedDate`, `ScannedNote`, `NoteSyncPayload`. `Note.tags` is a plain `string[]` populated by `extractTags`, distinct from any `frontmatter.tags` a note's frontmatter block might separately define.
- `noteSync.ts` — `BEAR_NOTES_HASH_KEY`.
