import { useMutation, useQueryClient } from '@tanstack/react-query'

import { translate } from '../i18n'

import { FLAGS_BASE_URL, READ_FLAG_NAME } from './flags.constants'
import type { FlagResponse } from './flags.types'

const toggleNoteRead = async (noteId: string): Promise<boolean> => {
  const response = await fetch(
    `${FLAGS_BASE_URL}/${encodeURIComponent(noteId)}/${READ_FLAG_NAME}`,
    {
      method: 'POST',
    }
  )

  if (!response.ok) {
    throw new Error(translate('errors.unableToToggleReadState'))
  }

  const result = (await response.json()) as FlagResponse

  return result.value
}

export const useToggleNoteRead = (noteId: string) => {
  const queryClient = useQueryClient()
  const queryKey = ['note-read', noteId] as const

  return useMutation({
    mutationFn: () => toggleNoteRead(noteId),
    onMutate: async () => {
      await queryClient.cancelQueries({ queryKey: [...queryKey] })
    },
    onSuccess: (isRead) => {
      queryClient.setQueryData(queryKey, isRead)
    },
    onSettled: async () => {
      await queryClient.invalidateQueries({ queryKey: [...queryKey] })
    },
  })
}
