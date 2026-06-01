import {
  Box,
  Card,
  Collapsible,
  Flex,
  Heading,
} from "@chakra-ui/react"

import { useIsRead } from "../../hooks/useIsRead/useIsRead"
import { useI18n } from "../../i18n"

import { OpenInObsidianButton } from "../OpenInObsidianButton/OpenInObsidianButton"
import { ToggleReadButton } from "../ToggleReadButton/ToggleReadButton"

import { noteContentStyles } from "./NotesCard.styles"
import type { NotesCardProps } from "./NotesCard.types"
import { sanitizeNoteHtml } from "./NotesCard.util"

export const NotesCard = ({ note }: NotesCardProps) => {
  const { t } = useI18n()
  const sanitizedHtml = sanitizeNoteHtml(note.html)
  const { data: isRead } = useIsRead(note.id)
  const isCollapsed = isRead ?? false

  return (
    <Card.Root>
      <Card.Header py="2">
        <Flex align="center" justify="space-between">
          <Heading size="md">{note.title}</Heading>
          <Flex gap="1" shrink={0}>
            <ToggleReadButton isRead={isCollapsed} noteId={note.id} />
            <OpenInObsidianButton note={note} />
          </Flex>
        </Flex>
      </Card.Header>
      <Collapsible.Root open={!isCollapsed} lazyMount>
        <Collapsible.Content>
          <Card.Body gap="4">
            <Box
              css={noteContentStyles}
              dangerouslySetInnerHTML={{ __html: sanitizedHtml }}
            />
            {note.linkedNotes && note.linkedNotes.length > 0 && (
              <Collapsible.Root>
                <Collapsible.Trigger asChild>
                  <Heading
                    size="sm"
                    cursor="pointer"
                    color="fg.muted"
                    _hover={{ color: "fg" }}
                  >
                    {t("notes.linkedNotes")} ({note.linkedNotes.length})
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
                              __html: sanitizeNoteHtml(linked.html),
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
