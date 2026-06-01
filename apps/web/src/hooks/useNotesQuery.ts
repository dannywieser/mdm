import { useQuery } from "@tanstack/react-query"

import { translate } from "../i18n"
import type { NotesResponse } from "../types/notes"

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? "/api"

const fetchNotes = async (view?: string): Promise<NotesResponse> => {
  const url = view
    ? `${API_BASE_URL}/notes?view=${encodeURIComponent(view)}`
    : `${API_BASE_URL}/notes`
  const response = await fetch(url)

  if (!response.ok) {
    throw new Error(translate("errors.unableToLoadNotes"))
  }

  return (await response.json()) as NotesResponse
}

export const useNotesQuery = (view?: string) =>
  useQuery({
    queryKey: ["notes", view],
    queryFn: () => fetchNotes(view),
  })
