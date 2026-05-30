import { Card, Flex, Heading, IconButton, Tooltip } from "@chakra-ui/react"
import { ExternalLink } from "lucide-react"
import type { Note } from "markdown"

import { useI18n } from "../../i18n"

interface NoteHeaderProps {
  note: Pick<Note, "title" | "obsidianUrl">
}

export function NoteHeader({ note }: NoteHeaderProps) {
  const { t } = useI18n()

  return (
    <Card.Header borderBottom="1px solid" borderColor="green.900">
      <Flex align="center" justify="space-between">
        <Heading size="md" color="green.300">
          {note.title}
        </Heading>
        <Tooltip content={t("notes.openInObsidian")}>
          <IconButton
            as="a"
            href={note.obsidianUrl}
            size="xs"
            variant="ghost"
            color="green.700"
            _hover={{ color: "green.400" }}
            aria-label={t("notes.openInObsidian")}
          >
            <ExternalLink size={14} />
          </IconButton>
        </Tooltip>
      </Flex>
    </Card.Header>
  )
}
