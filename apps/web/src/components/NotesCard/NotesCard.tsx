import {
  Card,
  Collapsible,
  Flex,
  Heading,
} from "@chakra-ui/react"

import { useIsRead } from "../../hooks/useIsRead/useIsRead"

import { LinkedNotesList } from "../LinkedNotesList"
import { OpenInObsidianButton } from "../OpenInObsidianButton"
import { MarkdownTree } from "../MarkdownTree"
import { NoteBadges } from "../NoteBadges"
import { ToggleReadButton } from "../ToggleReadButton"

import type { NotesCardProps } from "./NotesCard.types"

export const NotesCard = ({ note, badges = [] }: NotesCardProps) => {
  const { data: isRead } = useIsRead({ noteId: note.id })
  const isCollapsed = isRead ?? false

  return (
    <Card.Root bg="app.panelBackground" color="app.text">
      <Card.Header py="2">
        <Flex align="center" justify="space-between">
          <Flex direction="column" gap="2" minWidth="0">
            <Heading size="md">{note.title}</Heading>
            <NoteBadges badges={badges} note={note} />
          </Flex>
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
            <LinkedNotesList notes={note.linkedNotes ?? []} />
          </Card.Body>
        </Collapsible.Content>
      </Collapsible.Root>
    </Card.Root>
  )
}
