import { Card, Collapsible, Flex, Heading } from "@chakra-ui/react"

import { useI18n } from "../../i18n"
import { MarkdownTree } from "../MarkdownTree"

import type { LinkedNotesListProps } from "./LinkedNotesList.types"

export const LinkedNotesList = ({ notes }: LinkedNotesListProps) => {
  const { t } = useI18n()

  if (notes.length === 0) return null

  return (
    <Collapsible.Root>
      <Collapsible.Trigger asChild>
        <Heading
          size="sm"
          cursor="pointer"
          color="app.textMuted"
          _hover={{ color: "app.text" }}
        >
          {t("notes.linkedNotes")} ({notes.length})
        </Heading>
      </Collapsible.Trigger>
      <Collapsible.Content>
        <Flex direction="column" gap="3" mt="3">
          {notes.map((note) => (
            <Card.Root
              key={note.id}
              size="sm"
              variant="subtle"
              bg="app.panelBackgroundHover"
              color="app.text"
            >
              <Card.Header>
                <Heading size="sm">{note.title}</Heading>
              </Card.Header>
              <Card.Body>
                <MarkdownTree content={note.content} />
              </Card.Body>
            </Card.Root>
          ))}
        </Flex>
      </Collapsible.Content>
    </Collapsible.Root>
  )
}
