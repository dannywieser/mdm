import { Box, Card, Heading } from '@chakra-ui/react'
import DOMPurify from 'dompurify'
import { CircleCheck, CircleDashed } from 'lucide-react'
import type { Note } from 'markdown'
import { renderToStaticMarkup } from 'react-dom/server'

import { noteContentStyles } from './NotesCard.styles'

interface NotesCardProps {
  note: Note
}

const checkedIcon = renderToStaticMarkup(<CircleCheck size={16} className="task-list-icon task-list-icon--checked" />)
const uncheckedIcon = renderToStaticMarkup(<CircleDashed size={16} className="task-list-icon task-list-icon--unchecked" />)

function processTaskListHtml(html: string): string {
  return html.replace(/<input\s+[^>]*type="checkbox"[^>]*>/gi, (match) =>
    /\bchecked\b/i.test(match) ? checkedIcon : uncheckedIcon
  )
}

export const NotesCard = ({ note }: NotesCardProps) => {
  const sanitizedHtml = processTaskListHtml(DOMPurify.sanitize(note.html))

  return (
    <Card.Root>
      <Card.Header>
        <Heading size="md">{note.title}</Heading>
      </Card.Header>
      <Card.Body gap="4">
        <Box css={noteContentStyles} dangerouslySetInnerHTML={{ __html: sanitizedHtml }} />
      </Card.Body>
    </Card.Root>
  )
}
