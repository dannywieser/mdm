import { useQuery } from '@tanstack/react-query'

import type { NotesResponse } from '../types/notes'

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:3000'

const fetchNotes = async (): Promise<NotesResponse> => {
  const response = await fetch(`${API_BASE_URL}/notes`)

  if (!response.ok) {
    throw new Error('Unable to load notes')
  }

  return (await response.json()) as NotesResponse
}

export const useNotesQuery = () =>
  useQuery({
    queryKey: ['notes'],
    queryFn: fetchNotes
  })
