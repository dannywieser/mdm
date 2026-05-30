import { useQuery } from '@tanstack/react-query'

import { translate } from '../i18n'

const FLAGS_BASE_URL = import.meta.env.VITE_FLAGS_BASE_URL ?? '/flags'
const READ_FLAG = 'read'

interface FlagResponse {
  value: boolean
}

const fetchIsRead = async (noteId: string): Promise<boolean> => {
  const response = await fetch(
    `${FLAGS_BASE_URL}/${encodeURIComponent(noteId)}/${READ_FLAG}`
  )

  if (!response.ok) {
    throw new Error(translate('errors.unableToLoadReadState'))
  }

  const result = (await response.json()) as FlagResponse

  return result.value
}

export const useIsRead = (noteId: string) =>
  useQuery({
    queryKey: ['note-read', noteId],
    queryFn: () => fetchIsRead(noteId),
    enabled: noteId.trim().length > 0,
  })
