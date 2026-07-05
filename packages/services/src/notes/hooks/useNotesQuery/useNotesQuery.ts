import { useSuspenseQuery } from "@tanstack/react-query"

import type { NotesResponse } from "../../notes.types"
import type { UseNotesQueryParams } from "./useNotesQuery.types"

import { getBaseUrl } from "../../../config"
import { isDemoMode } from "../../../demo/demoMode"
import { buildDemoNotesUrl } from "../../../demo/demoUrls"

const buildNotesUrl = (view?: string, includeContent = true): string => {
  const params = new URLSearchParams()
  if (view) params.set("view", view)
  if (!includeContent) params.set("includeContent", "false")

  const queryString = params.toString()
  const baseUrl = getBaseUrl()
  return queryString ? `${baseUrl}/notes?${queryString}` : `${baseUrl}/notes`
}

const fetchNotes = async (view?: string, includeContent = true): Promise<NotesResponse> => {
  const url = isDemoMode()
    ? buildDemoNotesUrl(view, includeContent)
    : buildNotesUrl(view, includeContent)
  const response = await fetch(url)

  if (!response.ok) {
    throw new Error("errors.unableToLoadNotes")
  }

  return (await response.json()) as NotesResponse
}

export const useNotesQuery = ({ includeContent = true, view }: UseNotesQueryParams = {}) =>
  useSuspenseQuery({
    queryKey: ["notes", view, includeContent],
    queryFn: () => fetchNotes(view, includeContent),
  })
