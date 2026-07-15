# markdown

## 3.0.1

### Patch Changes

- mdm-util@3.0.1

## 3.0.0

### Patch Changes

- mdm-util@3.0.0

## 2.3.1

### Patch Changes

- mdm-util@2.3.1

## 2.3.0

### Minor Changes

- 5b101ab: Notes' frontmatter now always includes an `images` array derived from every image found in the note's raw body text (standard markdown or Obsidian `![[...]]` embeds), so notes no longer need an explicit `cover` frontmatter property. The web app's gallery view reads this array and displays a note's first image as its cover. The `NotesGalleryByMonth` and `NotesGalleryByYear` view components have been removed — use `NotesGallery` instead.

  Removed the `aspectRatio` and `layout` view config fields (from `app.config.json`'s `views`, the `GET /views` response, and the web app's view component props). These had become dead weight: `layout` was never read by any component after an earlier refactor to a CSS masonry grid, and `aspectRatio` only ever sized `NoteCoverGrid`'s pre-load loading skeleton — it did not shape the final rendered card, which sizes itself from the loaded image's natural dimensions. `NoteCoverGrid` now always uses a fixed default skeleton aspect ratio.

  Fixed a bug where a note's external image URL (e.g. `https://...`) in `frontmatter.images` would render as a broken image in the gallery — the web app was always routing it through the local image proxy, which rejects non-local paths. External URLs are now rendered directly, bypassing the proxy. Added a shared `isExternalUrl` helper to `mdm-util` for this check, also adopted by `notes-api`.

  Fixed two smaller edge cases in `frontmatter.images` derivation: a fragment-only image destination (`![alt](#section)`) is no longer surfaced as an image, since it isn't a resolvable image source; and a frontmatter image value with extra whitespace (e.g. from YAML like `" https://... "`) is now trimmed before checking whether it's an external URL, so it no longer gets incorrectly routed through the image proxy.

  Narrowed which external URLs the web app will render directly: only http(s) or protocol-relative URLs bypass the local image proxy now. Any other scheme (`javascript:`, `data:`, `obsidian://`, etc.) renders nothing instead of being passed to `<img src>` unchecked. Added a new `isHttpUrl` helper to `mdm-util` for this.

### Patch Changes

- Updated dependencies [5b101ab]
  - mdm-util@2.3.0

## 2.2.4

### Patch Changes

- mdm-util@2.2.4

## 2.2.3

### Patch Changes

- mdm-util@2.2.3

## 2.2.2

### Patch Changes

- mdm-util@2.2.2

## 2.2.1

### Patch Changes

- mdm-util@2.2.1

## 2.2.0

### Patch Changes

- mdm-util@2.2.0

## 2.1.6

### Patch Changes

- mdm-util@2.1.6

## 2.1.5

### Patch Changes

- mdm-util@2.1.5

## 2.1.4

### Patch Changes

- mdm-util@2.1.4

## 2.1.3

### Patch Changes

- mdm-util@2.1.3

## 2.1.2

### Patch Changes

- mdm-util@2.1.2

## 2.1.1

### Patch Changes

- mdm-util@2.1.1

## 2.1.0

### Patch Changes

- Updated dependencies [2abe52c]
  - mdm-util@2.1.0

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
