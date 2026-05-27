import { Box, Card, Heading } from '@chakra-ui/react'
import DOMPurify from 'dompurify'

import type { Note } from '../types/notes'

interface NotesCardProps {
  note: Note
}

export const NotesCard = ({ note }: NotesCardProps) => {
  const sanitizedHtml = DOMPurify.sanitize(note.html)

  return (
    <Card.Root>
      <Card.Body gap="4">
        <Heading size="md">{note.basename}</Heading>
        <Box dangerouslySetInnerHTML={{ __html: sanitizedHtml }} />
      </Card.Body>
    </Card.Root>
  )
}
