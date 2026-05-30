import {
  Box,
  Card,
  Collapsible,
  Flex,
  Heading,
} from '@chakra-ui/react'
import DOMPurify, { type Config as DOMPurifyConfig } from 'dompurify'
import type { Note } from 'markdown'

import { useI18n } from '../i18n'
import { useIsRead } from '../hooks/useIsRead'

import { noteContentStyles } from './NotesCard.styles'
import { ToggleReadButton } from './ToggleReadButton'

// Extends DOMPurify's default allowed protocols to include obsidian:// deep links.
const SANITIZE_CONFIG: DOMPurifyConfig = {
  ALLOWED_URI_REGEXP:
    /^(?:(?:(?:f|ht)tps?|mailto|tel|callto|cid|xmpp|obsidian):|[^a-z]|[a-z+.-]+(?:[^a-z+.:-]|$))/i,
}

interface NotesCardProps {
  note: Note
}

export const NotesCard = ({ note }: NotesCardProps) => {
  const { t } = useI18n()
  const sanitizedHtml = DOMPurify.sanitize(note.html, SANITIZE_CONFIG)
  const { data: isRead } = useIsRead(note.id)
  const isCollapsed = isRead ?? false

  return (
    <Card.Root>
      <Card.Header>
        <Flex align="center" justify="space-between" gap="3">
          <Heading size="md">{note.title}</Heading>
          <ToggleReadButton isRead={isCollapsed} noteId={note.id} />
        </Flex>
      </Card.Header>
      <Collapsible.Root open={!isCollapsed} lazyMount unmountOnExit>
        <Collapsible.Content>
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
                              __html: DOMPurify.sanitize(linked.html, SANITIZE_CONFIG),
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
        </Collapsible.Content>
      </Collapsible.Root>
    </Card.Root>
  )
}
