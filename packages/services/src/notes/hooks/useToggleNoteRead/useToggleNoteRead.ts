import { useMutation, useQueryClient } from "@tanstack/react-query"

import type { ToggleFlagResult } from "../../../flags/flags.types"
import type { UseToggleNoteReadParams } from "./useToggleNoteRead.types"

import { getFlagsBaseUrl } from "../../../config"
import { READ_FLAG_NAME } from "../../../flags/flags.constants"

const toggleNoteRead = async (noteId: string): Promise<boolean> => {
  const response = await fetch(
    `${getFlagsBaseUrl()}/${encodeURIComponent(noteId)}/${READ_FLAG_NAME}`,
    {
      method: "POST",
    },
  )

  if (!response.ok) {
    throw new Error("errors.unableToToggleReadState")
  }

  const result = (await response.json()) as ToggleFlagResult

  return result.value
}

export const useToggleNoteRead = ({ noteId }: UseToggleNoteReadParams) => {
  const queryClient = useQueryClient()
  const queryKey = ["note-read", noteId] as const

  return useMutation({
    mutationFn: () => toggleNoteRead(noteId),
    onMutate: async () => {
      await queryClient.cancelQueries({ queryKey })
    },
    onSuccess: (isRead) => {
      queryClient.setQueryData(queryKey, isRead)
    },
    onSettled: async () => {
      await queryClient.invalidateQueries({ queryKey })
    },
  })
}
