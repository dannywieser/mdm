import { Box, Card, Collapsible, Heading } from '@chakra-ui/react'
import DOMPurify from 'dompurify'
import type { Note } from 'markdown'

import { useI18n } from '../i18n'

import { noteContentStyles } from './NotesCard.styles'

interface NotesCardProps {
  note: Note
}

export const NotesCard = ({ note }: NotesCardProps) => {
  const { t } = useI18n()
  const sanitizedHtml = DOMPurify.sanitize(note.html)

  return (
    <Card.Root>
      <Card.Header>
        <Heading size="md">{note.title}</Heading>
      </Card.Header>
      <Card.Body gap="4">
        <Box css={noteContentStyles} dangerouslySetInnerHTML={{ __html: sanitizedHtml }} />
        {note.linkedNotes && note.linkedNotes.length > 0 && (
          <Collapsible.Root>
            <Collapsible.Trigger asChild>
              <Heading
                size="sm"
                cursor="pointer"
                color="fg.muted"
                _hover={{ color: 'fg' }}
              >
                {t('notes.linkedNotes')} ({note.linkedNotes.length})
              </Heading>
            </Collapsible.Trigger>
            <Collapsible.Content>
              <Box display="flex" flexDirection="column" gap="3" mt="3">
                {note.linkedNotes.map((linked) => (
                  <Card.Root key={linked.id} size="sm" variant="subtle">
                    <Card.Header>
                      <Heading size="sm">{linked.title}</Heading>
                    </Card.Header>
                    <Card.Body>
                      <Box
                        css={noteContentStyles}
                        dangerouslySetInnerHTML={{
                          __html: DOMPurify.sanitize(linked.html),
                        }}
                      />
                    </Card.Body>
                  </Card.Root>
                ))}
              </Box>
            </Collapsible.Content>
          </Collapsible.Root>
        )}
      </Card.Body>
    </Card.Root>
  )
}
