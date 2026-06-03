import type { Note } from "markdown"

export type LinkedNote = Pick<Note, "id" | "title" | "content">

export interface LinkedNotesListProps {
  notes: LinkedNote[]
}
