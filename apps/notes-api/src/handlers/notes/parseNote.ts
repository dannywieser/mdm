import { resolveNotesConfig } from "app-config"
import {
  buildMarkdownTree,
  Note,
  resolveWikilinks,
  ScannedNote,
} from "markdown"

export async function parseNote(
  note: ScannedNote,
  allNotes: ScannedNote[] = [],
): Promise<Note> {
  const { attachmentsDirectory } = await resolveNotesConfig()
  const normalizedRelativePath = note.relativePath ?? note.basename

  const { processedBody, linkedNoteRefs, replacements } = resolveWikilinks(
    note.fullText,
    allNotes,
  )

  const content = buildMarkdownTree(
    processedBody,
    normalizedRelativePath,
    replacements,
    attachmentsDirectory,
  )

  const linkedNotes = await Promise.all(
    linkedNoteRefs.map((linkedNote) => parseNote(linkedNote, [])),
  )

  return {
    ...note,
    content,
    linkedNotes,
  }
}
