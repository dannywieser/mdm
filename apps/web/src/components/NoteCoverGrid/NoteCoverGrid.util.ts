import type { Note } from "markdown"
import { isExternalUrl, isHttpUrl } from "mdm-util"
import { buildImageUrl } from "services"

import type { MasonryLayout, NoteCoverGridVariant } from "./NoteCoverGrid.types"

export function getNoteImagePaths(note: Note): string[] {
  const images = note.frontmatter?.images
  if (images == null) return []

  const list = Array.isArray(images) ? images : [images]
  return list
    // eslint-disable-next-line sonarjs/slow-regex -- input is a bounded frontmatter value, not user-controlled input
    .map((path) => path.trim().replace(/^["']+|["']+$/g, "").trim())
    .filter((path) => path !== "")
}

export function getImageSrc(path: string): string {
  if (isHttpUrl(path)) return path
  // Any other external scheme (javascript:, data:, obsidian://, etc.) isn't safe
  // to render directly, and the local image proxy would reject it too.
  if (isExternalUrl(path)) return ""
  return buildImageUrl({ path })
}

export function filterNotesWithImages(notes: Note[]): Note[] {
  return notes.filter((note) => getNoteImagePaths(note).length > 0)
}

const MASONRY_LAYOUTS: Record<NoteCoverGridVariant, MasonryLayout> = {
  compact: {
    columns: { base: 3, md: 5, lg: 6, xl: 7, "2xl": 8 },
    gapPx: 8,
    padding: 0,
    rowHeightPx: 4,
    titleFontSize: "xs",
  },
  default: {
    columns: { base: 1, md: 3, lg: 4, xl: 5, "2xl": 8 },
    gapPx: 16,
    padding: 6,
    rowHeightPx: 8,
    titleFontSize: "sm",
  },
}

/** Grid metrics for a gallery variant, shared by the grid and its cards. */
export function getMasonryLayout(variant: NoteCoverGridVariant): MasonryLayout {
  return MASONRY_LAYOUTS[variant]
}

/** Builds the responsive `gridTemplateColumns` value for a layout's column counts. */
export function buildGridTemplateColumns(
  layout: MasonryLayout,
): Record<string, string> {
  return Object.fromEntries(
    Object.entries(layout.columns).map(([breakpoint, count]) => [
      breakpoint,
      `repeat(${String(count)}, 1fr)`,
    ]),
  )
}
