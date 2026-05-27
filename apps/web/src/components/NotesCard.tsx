import { Box, Card, Heading } from '@chakra-ui/react'

import type { Note } from '../types/notes'

interface NotesCardProps {
  note: Note
}

export const NotesCard = ({ note }: NotesCardProps) => (
  <Card.Root>
    <Card.Body gap="4">
      <Heading size="md">{note.basename}</Heading>
      <Box dangerouslySetInnerHTML={{ __html: note.html }} />
    </Card.Body>
  </Card.Root>
)
