export interface LinkedNote {
  id: string
  title: string
  content: string
}

export interface LinkedNotesListProps {
  notes: LinkedNote[]
}
