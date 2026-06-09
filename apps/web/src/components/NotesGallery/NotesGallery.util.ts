import type { FrontmatterValue, Note } from "markdown"

export function getCoverSrc(cover: FrontmatterValue): string {
  const path = Array.isArray(cover) ? cover[0] : cover
  return `/images?path=${encodeURIComponent(path)}`
}

export function filterNotesWithCovers(notes: Note[]): Note[] {
  return notes.filter((note) => {
    const cover = note.frontmatter?.cover
    if (cover == null) return false
    if (Array.isArray(cover)) return cover.length > 0 && cover[0] !== ""
    return cover !== ""
  })
}
