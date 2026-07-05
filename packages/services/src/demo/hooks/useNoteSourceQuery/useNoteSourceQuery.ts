import { useSuspenseQuery } from "@tanstack/react-query"

import type { UseNoteSourceQueryParams } from "./useNoteSourceQuery.types"

import { buildDemoNoteSourceUrl } from "../../demoUrls"

const fetchNoteSource = async (noteId: string): Promise<string> => {
  const response = await fetch(buildDemoNoteSourceUrl(noteId))

  if (!response.ok) {
    throw new Error("errors.unableToLoadNoteSource")
  }

  return response.text()
}

/**
 * Loads a note's raw markdown source from the demo snapshot. Demo mode only:
 * the live services do not expose note source, so the demo captures one
 * markdown file per note id at snapshot time.
 */
export const useNoteSourceQuery = ({ noteId }: UseNoteSourceQueryParams) =>
  useSuspenseQuery({
    queryKey: ["note-source", noteId],
    queryFn: () => fetchNoteSource(noteId),
  })
