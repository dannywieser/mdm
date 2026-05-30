import { Card, Flex, Heading, IconButton } from "@chakra-ui/react"
import { ExternalLink } from "lucide-react"
import type { Note } from "markdown"

import { useI18n } from "../../i18n"

interface NoteHeaderProps {
  note: Pick<Note, "title" | "obsidianUrl">
}

export function NoteHeader({ note }: NoteHeaderProps) {
  const { t } = useI18n()

  return (
    <Card.Header borderBottom="1px solid" borderColor="green.900" px={3} py={2}>
      <Flex align="center" justify="space-between">
        <Heading size="md" color="green.300">
          {note.title}
        </Heading>
        <IconButton
          asChild
          size="xs"
          variant="ghost"
          color="green.700"
          _hover={{ bg: "green.800", color: "white" }}
          aria-label={t("notes.openInObsidian")}
        >
          <a href={note.obsidianUrl}>
            <ExternalLink size={14} />
          </a>
        </IconButton>
      </Flex>
    </Card.Header>
  )
}
