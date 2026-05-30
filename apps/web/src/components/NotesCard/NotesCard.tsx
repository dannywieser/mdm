import { Box, Card, Collapsible, Heading } from "@chakra-ui/react"
import DOMPurify, { type Config as DOMPurifyConfig } from "dompurify"

import { useI18n } from "../../i18n"

import { noteContentStyles } from "./NotesCard.styles"
import type { NotesCardProps } from "./NotesCard.types"

// Extends DOMPurify's default allowed protocols to include obsidian:// deep links.
const SANITIZE_CONFIG: DOMPurifyConfig = {
  ALLOWED_URI_REGEXP:
    /^(?:(?:(?:f|ht)tps?|mailto|tel|callto|cid|xmpp|obsidian):|[^a-z]|[a-z+.-]+(?:[^a-z+.:-]|$))/i,
}

export const NotesCard = ({ note }: NotesCardProps) => {
  const { t } = useI18n()
  const sanitizedHtml = DOMPurify.sanitize(note.html, SANITIZE_CONFIG)

  return (
    <Card.Root
      bg="gray.950"
      borderColor="green.900"
      color="green.400"
      fontFamily="mono"
    >
      <Card.Header borderBottom="1px solid" borderColor="green.900">
        <Heading size="md" color="green.300">
          {note.title}
        </Heading>
      </Card.Header>
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
                color="green.700"
                _hover={{ color: "green.500" }}
              >
                {t("notes.linkedNotes")} ({note.linkedNotes.length})
              </Heading>
            </Collapsible.Trigger>
            <Collapsible.Content>
              <Box display="flex" flexDirection="column" gap="3" mt="3">
                {note.linkedNotes.map((linked) => (
                  <Card.Root
                    key={linked.id}
                    size="sm"
                    bg="black"
                    borderColor="green.900"
                    color="green.400"
                    fontFamily="mono"
                  >
                    <Card.Header
                      borderBottom="1px solid"
                      borderColor="green.900"
                    >
                      <Heading size="sm" color="green.300">
                        {linked.title}
                      </Heading>
                    </Card.Header>
                    <Card.Body>
                      <Box
                        css={noteContentStyles}
                        dangerouslySetInnerHTML={{
                          __html: DOMPurify.sanitize(
                            linked.html,
                            SANITIZE_CONFIG,
                          ),
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
