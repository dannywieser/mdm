import { useSuspenseQuery } from "@tanstack/react-query"

import { translate } from "../../i18n"
import type { NotesResponse } from "../../types/notes"

import type { UseNotesQueryParams } from "./useNotesQuery.types"

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? "/api"

const fetchNotes = async (view?: string, includeContent: boolean = true): Promise<NotesResponse> => {
  const params = new URLSearchParams()
  if (view) params.set("view", view)
  if (!includeContent) params.set("includeContent", "false")

  const queryString = params.toString()
  const url = queryString ? `${API_BASE_URL}/notes?${queryString}` : `${API_BASE_URL}/notes`
  const response = await fetch(url)

  if (!response.ok) {
    throw new Error(translate("errors.unableToLoadNotes"))
  }

  return (await response.json()) as NotesResponse
}

export const useNotesQuery = ({ includeContent = true, view }: UseNotesQueryParams = {}) =>
  useSuspenseQuery({
    queryKey: ["notes", view, includeContent],
    queryFn: () => fetchNotes(view, includeContent),
  })
