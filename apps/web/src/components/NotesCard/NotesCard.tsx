import {
  Card,
  Collapsible,
  Flex,
  Heading,
} from "@chakra-ui/react"

import { useIsRead } from "../../hooks/useIsRead/useIsRead"
import { useI18n } from "../../i18n"

import { OpenInObsidianButton } from "../OpenInObsidianButton/OpenInObsidianButton"
import { MarkdownTree } from "../MarkdownTree/MarkdownTree"
import { ToggleReadButton } from "../ToggleReadButton/ToggleReadButton"

import type { NotesCardProps } from "./NotesCard.types"

export const NotesCard = ({ note }: NotesCardProps) => {
  const { t } = useI18n()
  const { data: isRead } = useIsRead({ noteId: note.id })
  const isCollapsed = isRead ?? false

  return (
    <Card.Root bg="app.panelBackground" color="app.text">
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
            <MarkdownTree content={note.content} />
            {note.linkedNotes && note.linkedNotes.length > 0 && (
              <Collapsible.Root>
                <Collapsible.Trigger asChild>
                  <Heading
                    size="sm"
                    cursor="pointer"
                    color="app.textMuted"
                    _hover={{ color: "app.text" }}
                  >
                    {t("notes.linkedNotes")} ({note.linkedNotes.length})
                  </Heading>
                </Collapsible.Trigger>
                <Collapsible.Content>
                  <Flex direction="column" gap="3" mt="3">
                    {note.linkedNotes.map((linked) => (
                      <Card.Root key={linked.id} size="sm" variant="subtle" bg="app.panelBackgroundHover" color="app.text">
                        <Card.Header>
                          <Heading size="sm">{linked.title}</Heading>
                        </Card.Header>
                        <Card.Body>
                          <MarkdownTree content={linked.content} />
                        </Card.Body>
                      </Card.Root>
                    ))}
                  </Flex>
                </Collapsible.Content>
              </Collapsible.Root>
            )}
          </Card.Body>
        </Collapsible.Content>
      </Collapsible.Root>
    </Card.Root>
  )
}
