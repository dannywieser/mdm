import { Box, Card } from "@chakra-ui/react"
import DOMPurify from "dompurify"

import { LinkedNotes } from "./LinkedNotes"
import { NoteHeader } from "./NoteHeader"
import { SANITIZE_CONFIG } from "./NotesCard.constants"
import { noteContentStyles } from "./NotesCard.styles"
import type { NotesCardProps } from "./NotesCard.types"

export const NotesCard = ({ note }: NotesCardProps) => {
  const sanitizedHtml = DOMPurify.sanitize(note.html, SANITIZE_CONFIG)

  return (
    <Card.Root
      bg="gray.950"
      borderColor="green.900"
      color="green.400"
      fontFamily="mono"
    >
      <NoteHeader note={note} />
      <Card.Body gap="4">
        <Box
          css={noteContentStyles}
          dangerouslySetInnerHTML={{ __html: sanitizedHtml }}
        />
        {note.linkedNotes && note.linkedNotes.length > 0 && (
          <LinkedNotes linkedNotes={note.linkedNotes} />
        )}
      </Card.Body>
    </Card.Root>
  )
}
