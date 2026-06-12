import { useQuery } from "@tanstack/react-query"

import type { ToggleFlagResult } from "../../flags.types"
import type { UseIsReadParams } from "./useIsRead.types"

import { getFlagsBaseUrl } from "../../../config"
import { READ_FLAG_NAME } from "../../flags.constants"

export const fetchIsRead = async (noteId: string): Promise<boolean> => {
  const response = await fetch(
    `${getFlagsBaseUrl()}/${encodeURIComponent(noteId)}/${READ_FLAG_NAME}`,
  )

  if (!response.ok) {
    throw new Error("errors.unableToLoadReadState")
  }

  const result = (await response.json()) as ToggleFlagResult

  return result.value
}

export const useIsRead = ({ noteId }: UseIsReadParams) =>
  useQuery({
    queryKey: ["note-read", noteId],
    queryFn: () => fetchIsRead(noteId),
    enabled: noteId.trim().length > 0,
  })
