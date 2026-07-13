# markdown

Low-level parsing utilities for Obsidian-flavored markdown notes: YAML-ish frontmatter parsing, date extraction from note text, and vault file collection. Owns the `Note` type used across the codebase. Depends only on `mdm-util`.

## Usage

```ts
import { collectMarkdownFiles, parseFrontMatter, parseMarkdownBodyDates, extractNoteDates, resolveDateFromFrontmatterOrTitle, resolveOldestDate, buildObsidianUrl, parseDateString, extractFirstImagePath } from "markdown"
import type { Note, NoteFrontmatter, MarkdownNode } from "markdown"
```

## Structure

- `files/collectMarkdownFiles.ts` — recursively collects absolute paths of every `.md`/`.markdown` file under a directory.
- `files/buildObsidianUrl.ts` — builds an `obsidian://open` deep link for a file relative to the vault root.
- `parsers/parseFrontMatter.ts` — splits a raw file's `---`-delimited YAML frontmatter block from its body, resolving Obsidian `[[wikilink]]`/`[[wikilink|alias]]` frontmatter values to their plain target string.
- `parsers/parseMarkdownBodyDates.ts` — scans arbitrary text for every substring matching a set of tokenized date formats (`YYYY`, `YY`, `MM`, `DD`), returning matches in the order first found.
- `parsers/parseDateString.ts` — parses a single string against a set of date formats into a `Date`.
- `parsers/extractFirstImagePath.ts` — scans raw markdown text (not the parsed node tree) for the first image, matching either standard `![alt](path)` syntax or an Obsidian `![[path]]`/`![[path|alias]]` embed, and returns its raw path.
- `dates/extractNoteDates.ts` — extracts every date found across a note's title and full raw source (frontmatter + body) in one pass, deduplicated.
- `dates/resolveDateFromFrontmatterOrTitle.ts` — resolves a note's date from a configured frontmatter property, falling back to a date embedded in the title.
- `dates/resolveOldestDate.ts` — resolves the earliest of a list of date strings, parsing each against the configured formats and then as ISO 8601.
- `types.ts` — `Note`, `NoteFrontmatter`, `FrontmatterValue`, `MarkdownNode`, `ParsedFrontMatter`, `ParsedDate`.
