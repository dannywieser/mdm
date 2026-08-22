# markdown

Low-level parsing utilities for Obsidian-flavored markdown notes: YAML-ish frontmatter parsing, date extraction from note text, and vault file collection. Owns the `Note` type used across the codebase, and the `ScannedNote`/`NoteSyncPayload` shapes shared between `notes-api`, `notes-ingest`, and `bear-sync` for the Bear note source. Depends only on `mdm-util`.

## Usage

```ts
import { collectMarkdownFiles, FILE_ID_NAMESPACE, parseFrontMatter, parseMarkdownBodyDates, extractNoteDates, resolveDateFromFrontmatterOrTitle, resolveOldestDate, buildObsidianUrl, parseDateString, extractImagePaths, isImageUrl, resolveFrontmatterImages, resolveLocalImagePath, extractTags, TAG_PATTERN, BEAR_NOTES_HASH_KEY, loadScannedNotesFromHash } from "markdown"
import type { Note, NoteFrontmatter, MarkdownNode, ScannedNote, NoteSyncPayload, ScannedNotesRedisClient } from "markdown"
```

- `ScannedNote` (`Omit<Note, "content">`) is a note with frontmatter/dates/metadata parsed but before the expensive markdown AST parse + wikilink resolution step — the shape both the Obsidian file-scan path and the Bear sync path produce.
- `NoteSyncPayload` (`{ upserts: ScannedNote[], deletedIds: string[] }`) is the request body `notes-ingest`'s `POST /notes/sync` accepts.
- `BEAR_NOTES_HASH_KEY` is the Redis hash key `notes-ingest` writes Bear-sourced notes to and every Bear-mode consumer (`notes-api`, `habit-tracker`, `stats-service`) reads from — kept here as the one shared constant so those services can't drift on it independently.
- `loadScannedNotesFromHash(redisClient)` reads every note out of the `notes:bear` hash via `redisClient.hGetAll` and JSON-parses each value into a `ScannedNote`, silently skipping any value that fails to parse. `redisClient` only needs to satisfy the narrow `ScannedNotesRedisClient` interface (`hGetAll`), so callers can pass `mdm-util/redis`'s `createRedisClient()` result (or any structurally-compatible client) without an extra dependency. This is the one piece of Bear-Redis reading logic shared by every consumer of the `notes:bear` hash — each service still wires up its own Redis connection lifecycle (see `notes-api`, `habit-tracker`, or `stats-service`'s `server.ts` for the connect-only-in-bear-mode pattern).

## Structure

- `files/collectMarkdownFiles.ts` — recursively collects absolute paths of every `.md`/`.markdown` file under a directory.
- `files/buildObsidianUrl.ts` — builds an `obsidian://open` deep link for a file relative to the vault root.
- `files/fileIdNamespace.ts` — `FILE_ID_NAMESPACE`, the UUIDv5 namespace every note source seeds `createFileID` with. Shared so services that scan the same vault independently (`notes-api` and `transaction-tracker`) resolve a given note to the same `id`, which is what makes cross-service note links work.
- `parsers/parseFrontMatter.ts` — splits a raw file's `---`-delimited YAML frontmatter block from its body, resolving Obsidian `[[wikilink]]`/`[[wikilink|alias]]` frontmatter values to their plain target string.
- `parsers/parseMarkdownBodyDates.ts` — scans arbitrary text for every substring matching a set of tokenized date formats (`YYYY`, `YY`, `MM`, `DD`), returning matches in the order first found.
- `parsers/parseDateString.ts` — parses a single string against a set of date formats into a `Date`.
- `parsers/extractImagePaths.ts` — scans raw markdown text (not the parsed node tree) for every image, matching standard `![alt](path)` syntax (including `<path>`-bracketed and titled destinations), an Obsidian `![[path]]`/`![[path|alias]]` embed, or a plain `[label](url)` link whose destination looks like an image file per `isImageUrl` (Bear's inline-image-preview format, e.g. `[3h6HmH](https://images.example.com/i/3h6HmH.jpg)`) — and returns each raw path/URL in document order, deduplicated.
- `parsers/isImageUrl.ts` — whether a URL or path's file extension (`.jpg`, `.png`, `.gif`, `.webp`, `.svg`, `.bmp`, `.avif`, `.ico`, `.tif`/`.tiff`, ignoring any trailing query string or fragment) indicates it points at an image.
- `parsers/resolveFrontmatterImages.ts` — derives a note's `frontmatter.images` array from every image found via `extractImagePaths` in its raw body, resolving each through `resolveLocalImagePath` (external URLs are kept as-is) and replacing any `images` value already present in frontmatter. Returns `null` when there's neither frontmatter nor any images. Shared by the Obsidian file-scan path and the Bear sync path so both sources populate `frontmatter.images` the same way.
- `parsers/resolveLocalImagePath.ts` — resolves a raw local image path found in a note's body to a vault-relative path (bare filenames are rooted in the note's own attachment folder, Obsidian-style; `null` for external URLs or paths that would traverse outside the vault).
- `parsers/extractTags.ts` — scans raw markdown text for inline hashtags the way Bear/Obsidian render them: `#foo/bar` (simple, `/` nests) or `#multi word tag#` (Bear's closing-hash form for tags containing spaces). A nested tag is expanded into its individual segments in addition to the full tag — `#foo/bar` yields `"foo"`, `"bar"`, and `"foo/bar"` — so hierarchy-aware filtering can match on any level. Returns tags in document order, deduplicated. Also exports `TAG_PATTERN`, the underlying regex, so callers that need to locate (not just list) tags — like `notes-api`'s inline tag-node rendering, which keeps the full unsplit tag — can reuse the same matching rules.
- `dates/extractNoteDates.ts` — extracts every date found across a note's title and full raw source (frontmatter + body) in one pass, deduplicated.
- `dates/resolveDateFromFrontmatterOrTitle.ts` — resolves a note's date from a configured frontmatter property, falling back to a date embedded in the title.
- `dates/resolveOldestDate.ts` — resolves the earliest of a list of date strings, parsing each against the configured formats and then as ISO 8601.
- `types.ts` — `Note`, `NoteFrontmatter`, `FrontmatterValue`, `MarkdownNode`, `ParsedFrontMatter`, `ParsedDate`, `ScannedNote`, `NoteSyncPayload`. `Note.tags` is a plain `string[]` populated by `extractTags`, distinct from any `frontmatter.tags` a note's frontmatter block might separately define.
- `noteSync.ts` — `BEAR_NOTES_HASH_KEY`.
- `redis/loadScannedNotesFromHash.ts` — `loadScannedNotesFromHash`, and the `ScannedNotesRedisClient` type (in the colocated `.types.ts` file) it accepts.
