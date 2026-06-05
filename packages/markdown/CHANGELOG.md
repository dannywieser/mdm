# markdown

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
