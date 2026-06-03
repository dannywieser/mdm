import { useQuery } from "@tanstack/react-query"

import { translate } from "../../i18n"

import { FLAGS_BASE_URL, READ_FLAG_NAME } from "../flags.constants"
import type { FlagResponse } from "../flags.types"

import type { UseIsReadParams } from "./useIsRead.types"

export const fetchIsRead = async (noteId: string): Promise<boolean> => {
  const response = await fetch(
    `${FLAGS_BASE_URL}/${encodeURIComponent(noteId)}/${READ_FLAG_NAME}`,
  )

  if (!response.ok) {
    throw new Error(translate("errors.unableToLoadReadState"))
  }

  const result = (await response.json()) as FlagResponse

  return result.value
}

export const useIsRead = ({ noteId }: UseIsReadParams) =>
  useQuery({
    queryKey: ["note-read", noteId],
    queryFn: () => fetchIsRead(noteId),
    enabled: noteId.trim().length > 0,
  })
