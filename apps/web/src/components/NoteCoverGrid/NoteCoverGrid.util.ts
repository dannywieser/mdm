import type { Note } from "markdown"
import { buildImageUrl } from "services"

export function getNoteImagePaths(note: Note): string[] {
  const images = note.frontmatter?.images
  if (images == null) return []

  const list = Array.isArray(images) ? images : [images]
  return list
    // eslint-disable-next-line sonarjs/slow-regex -- input is a bounded frontmatter value, not user-controlled input
    .map((path) => path.replace(/^["']+|["']+$/g, ""))
    .filter((path) => path !== "")
}

export function getImageSrc(path: string): string {
  return buildImageUrl({ path })
}

export function filterNotesWithImages(notes: Note[]): Note[] {
  return notes.filter((note) => getNoteImagePaths(note).length > 0)
}
