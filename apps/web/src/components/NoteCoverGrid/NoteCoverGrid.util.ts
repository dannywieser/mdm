import type { FrontmatterValue, Note } from "markdown"
import { buildImageUrl } from "services"

export function getCoverSrc(cover: FrontmatterValue): string {
  const path = Array.isArray(cover) ? cover[0] : cover
  // eslint-disable-next-line sonarjs/slow-regex -- input is a bounded frontmatter value, not user-controlled input
  const unquotedPath = path.replace(/^["']+|["']+$/g, "")
  return buildImageUrl({ path: unquotedPath })
}

export function filterNotesWithCovers(notes: Note[]): Note[] {
  return notes.filter((note) => {
    const cover = note.frontmatter?.cover
    if (cover == null) return false
    if (Array.isArray(cover)) return cover.length > 0 && cover[0] !== ""
    return cover !== ""
  })
}
