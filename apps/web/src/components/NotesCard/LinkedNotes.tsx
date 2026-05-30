import { Box, Card, Collapsible, Heading } from "@chakra-ui/react"
import DOMPurify from "dompurify"
import type { Note } from "markdown"

import { useI18n } from "../../i18n"

import { noteContentStyles } from "./NotesCard.styles"
import { SANITIZE_CONFIG } from "./NotesCard.constants"

interface LinkedNotesProps {
  linkedNotes: Note[]
}

export function LinkedNotes({ linkedNotes }: LinkedNotesProps) {
  const { t } = useI18n()

  return (
    <Collapsible.Root>
      <Collapsible.Trigger asChild>
        <Heading
          size="sm"
          cursor="pointer"
          color="green.700"
          _hover={{ color: "green.500" }}
        >
          {t("notes.linkedNotes")} ({linkedNotes.length})
        </Heading>
      </Collapsible.Trigger>
      <Collapsible.Content>
        <Box display="flex" flexDirection="column" gap="3" mt="3">
          {linkedNotes.map((linked) => (
            <Card.Root
              key={linked.id}
              size="sm"
              bg="black"
              borderColor="green.900"
              color="green.400"
              fontFamily="mono"
            >
              <Card.Header borderBottom="1px solid" borderColor="green.900">
                <Heading size="sm" color="green.300">
                  {linked.title}
                </Heading>
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
  )
}
