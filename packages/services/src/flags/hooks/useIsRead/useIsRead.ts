import { useQuery } from "@tanstack/react-query"

import type { ToggleFlagResult } from "../../flags.types"
import type { UseIsReadParams } from "./useIsRead.types"

import { getFlagsBaseUrl } from "../../../config"
import { readDemoFlag } from "../../../demo/demoFlags"
import { isDemoMode } from "../../../demo/demoMode"
import { READ_FLAG_NAME } from "../../flags.constants"

export const fetchIsRead = async (noteId: string): Promise<boolean> => {
  if (isDemoMode()) {
    return readDemoFlag(noteId, READ_FLAG_NAME)
  }

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
    queryKey: ["read", noteId],
    queryFn: () => fetchIsRead(noteId),
    enabled: noteId.trim().length > 0,
  })
