import { IconButton } from '@chakra-ui/react'
import { Book, BookCheck } from 'lucide-react'

import { useToggleNoteRead } from '../hooks/useToggleNoteRead'
import { useI18n } from '../i18n'

interface ToggleReadButtonProps {
  isRead: boolean
  noteId: string
}

export const ToggleReadButton = ({ isRead, noteId }: ToggleReadButtonProps) => {
  const { t } = useI18n()
  const toggleRead = useToggleNoteRead(noteId)
  const toggleLabel = isRead ? t('notes.markAsUnread') : t('notes.markAsRead')

  return (
    <IconButton
      aria-label={toggleLabel}
      title={toggleLabel}
      size="sm"
      variant={isRead ? 'subtle' : 'ghost'}
      colorPalette={isRead ? 'green' : 'gray'}
      onClick={() => toggleRead.mutate()}
      loading={toggleRead.isPending}
    >
      {isRead ? <BookCheck size={16} /> : <Book size={16} />}
    </IconButton>
  )
}
