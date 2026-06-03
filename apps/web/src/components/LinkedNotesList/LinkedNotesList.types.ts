import type { MarkdownNode } from "markdown"

export interface LinkedNote {
  id: string
  title: string
  content: MarkdownNode
}

export interface LinkedNotesListProps {
  notes: LinkedNote[]
}
