import type { FrontmatterValue, Note } from "markdown"

export function getCoverSrc(cover: FrontmatterValue): string {
  const path = Array.isArray(cover) ? cover[0] : cover
  const unquotedPath = path.replace(/^["']+|["']+$/g, "")
  return `/images?path=${encodeURIComponent(unquotedPath)}`
}

export function filterNotesWithCovers(notes: Note[]): Note[] {
  return notes.filter((note) => {
    const cover = note.frontmatter?.cover
    if (cover == null) return false
    if (Array.isArray(cover)) return cover.length > 0 && cover[0] !== ""
    return cover !== ""
  })
}
