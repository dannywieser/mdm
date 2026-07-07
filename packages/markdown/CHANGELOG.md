# markdown

## 2.0.2

### Patch Changes

- Updated dependencies [b3996b4]
- Updated dependencies [a9c4d83]
  - mdm-util@2.0.2

## 2.0.1

### Patch Changes

- mdm-util@2.0.1

## 2.0.0

### Minor Changes

- 492658e: Renamed the `titleOrBodyDates` note property to `dates`, and expanded it to include every date found in a note's title, body, and frontmatter, plus the file's modified date. `createdDate` is now derived as the oldest date in this list instead of preferring a configured frontmatter property.

### Patch Changes

- Updated dependencies [fb9cd71]
- Updated dependencies [498a480]
  - mdm-util@2.0.0

## 1.10.0

### Patch Changes

- Updated dependencies [aad607c]
  - mdm-util@1.10.0

## 1.9.0

### Patch Changes

- mdm-util@1.9.0

## 1.8.0

### Patch Changes

- da76fb7: Add a search input to the header on the notes gallery view that filters note cards by matching keywords against the title, frontmatter, and full note body text. The `/notes` API response now includes a `fullText` field on each note containing its raw markdown body.
  - mdm-util@1.8.0

## 1.7.0

### Minor Changes

- 88032d0: Moved shared markdown file-loading helpers (`collectMarkdownFiles`, `buildObsidianUrl`, `resolveDateFromFrontmatterOrTitle`) into the `markdown` package and updated `notes-api` and `habit-tracker` to use them, removing duplicated implementations.

### Patch Changes

- mdm-util@1.7.0

## 1.6.1

### Patch Changes

- mdm-util@1.6.1

## 1.6.0

### Patch Changes

- Updated dependencies [be835c4]
  - mdm-util@1.6.0

## 1.5.0

### Minor Changes

- 28e9b81: Resolve Obsidian wikilink syntax (`[[path]]` and `"[[path|alias]]"`) in frontmatter values during parsing, so fields like `cover` produce a plain file path rather than a raw wikilink string.

### Patch Changes

- mdm-util@1.5.0

## 1.4.0

### Patch Changes

- mdm-util@1.4.0

## 1.3.0

### Minor Changes

- 298b99c: Refactor notes markdown parsing and rendering to use markdown node trees instead of HTML, including Chakra-based markdown rendering and wikilink/image handling updates.

### Patch Changes

- mdm-util@1.3.0

## 1.2.0

### Patch Changes

- mdm-util@1.2.0

## 1.1.0

### Minor Changes

- 7e53688: Add Obsidian-style `[[wikilink]]` resolution to the notes pipeline. Matched wikilinks render as clickable `obsidian://` links; unmatched wikilinks render with a dashed underline. The web UI displays linked notes in a collapsible section at the bottom of each card.

### Patch Changes

- e41efd1: Add initial Changesets setup for the monorepo, including root scripts, fixed-release configuration, and contributor docs for changelog entries.
- Updated dependencies [e41efd1]
  - mdm-util@1.1.0
