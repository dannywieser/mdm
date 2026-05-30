import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import type { Note } from 'markdown'
import { describe, expect, it } from 'vitest'

import { TerminalNoteBlock } from './TerminalNoteBlock'

const baseNote: Note = {
  id: 'note-1',
  title: 'My Note',
  basename: 'my-note',
  titleOrBodyDates: [],
  createdDate: '2026-01-01',
  folder: 'daily',
  frontmatter: null,
  fullPath: '/daily/my-note.md',
  html: '<p>Hello world</p>',
  linkedNotes: [],
  modifiedDate: '2026-01-01',
  obsidianUrl: 'obsidian://open?vault=v&file=my-note',
}

describe('TerminalNoteBlock', () => {
  it('renders the note title and metadata', () => {
    render(<TerminalNoteBlock note={baseNote} />)

    expect(screen.getByText('My Note')).toBeTruthy()
    expect(screen.getByText(/2026-01-01/)).toBeTruthy()
    expect(screen.getByText(/daily/)).toBeTruthy()
  })

  it('renders sanitized note HTML content', () => {
    render(<TerminalNoteBlock note={baseNote} />)

    expect(screen.getByText('Hello world')).toBeTruthy()
  })

  it('does not render linked notes section when there are no linked notes', () => {
    render(<TerminalNoteBlock note={baseNote} />)

    expect(document.querySelector('.terminal-note-linked')).toBeNull()
  })

  it('renders linked notes toggle when linked notes exist', () => {
    const noteWithLinked: Note = {
      ...baseNote,
      linkedNotes: [
        {
          ...baseNote,
          id: 'linked-1',
          title: 'Linked Note',
          html: '<p>Linked content</p>',
        },
      ],
    }

    render(<TerminalNoteBlock note={noteWithLinked} />)

    expect(screen.getByText(/linked notes \(1\)/)).toBeTruthy()
  })

  it('expands linked notes when the toggle is clicked', async () => {
    const noteWithLinked: Note = {
      ...baseNote,
      linkedNotes: [
        {
          ...baseNote,
          id: 'linked-1',
          title: 'Linked Note',
          html: '<p>Linked content</p>',
        },
      ],
    }

    render(<TerminalNoteBlock note={noteWithLinked} />)

    await userEvent.click(screen.getByRole('button', { name: /linked notes/i }))

    expect(screen.getByText('Linked Note')).toBeTruthy()
    expect(screen.getByText('Linked content')).toBeTruthy()
  })
})
