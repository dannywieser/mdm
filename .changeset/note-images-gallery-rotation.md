---
"app-config": minor
"markdown": minor
"mdm-util": minor
"notes-api": minor
"services": minor
"web": minor
---

Notes' frontmatter now always includes an `images` array derived from every image found in the note's raw body text (standard markdown or Obsidian `![[...]]` embeds), so notes no longer need an explicit `cover` frontmatter property. The web app's gallery view reads this array and displays a note's first image as its cover. The `NotesGalleryByMonth` and `NotesGalleryByYear` view components have been removed — use `NotesGallery` instead.

Removed the `aspectRatio` and `layout` view config fields (from `app.config.json`'s `views`, the `GET /views` response, and the web app's view component props). These had become dead weight: `layout` was never read by any component after an earlier refactor to a CSS masonry grid, and `aspectRatio` only ever sized `NoteCoverGrid`'s pre-load loading skeleton — it did not shape the final rendered card, which sizes itself from the loaded image's natural dimensions. `NoteCoverGrid` now always uses a fixed default skeleton aspect ratio.

Fixed a bug where a note's external image URL (e.g. `https://...`) in `frontmatter.images` would render as a broken image in the gallery — the web app was always routing it through the local image proxy, which rejects non-local paths. External URLs are now rendered directly, bypassing the proxy. Added a shared `isExternalUrl` helper to `mdm-util` for this check, also adopted by `notes-api`.

Fixed two smaller edge cases in `frontmatter.images` derivation: a fragment-only image destination (`![alt](#section)`) is no longer surfaced as an image, since it isn't a resolvable image source; and a frontmatter image value with extra whitespace (e.g. from YAML like `" https://... "`) is now trimmed before checking whether it's an external URL, so it no longer gets incorrectly routed through the image proxy.

Narrowed which external URLs the web app will render directly: only http(s) or protocol-relative URLs bypass the local image proxy now. Any other scheme (`javascript:`, `data:`, `obsidian://`, etc.) renders nothing instead of being passed to `<img src>` unchecked. Added a new `isHttpUrl` helper to `mdm-util` for this.
