import { ChakraProvider, defaultSystem } from '@chakra-ui/react'
import { fireEvent, render, screen } from '@testing-library/react'
import type { Note } from 'markdown'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import { NotesCard } from './NotesCard'

const useIsReadMock = vi.fn()
const useToggleNoteReadMock = vi.fn()
const mutateMock = vi.fn()

vi.mock('../hooks/useIsRead', () => ({
  useIsRead: (noteId: string) => useIsReadMock(noteId),
}))

vi.mock('../hooks/useToggleNoteRead', () => ({
  useToggleNoteRead: (noteId: string) => useToggleNoteReadMock(noteId),
}))

const noteFixture: Note = {
  basename: 'My Note',
  titleOrBodyDates: [],
  createdDate: '2026-01-01',
  folder: 'daily',
  frontmatter: null,
  fullPath: '/daily/my-note.md',
  html: '<p>Hello</p>',
  id: 'my-note',
  linkedNotes: [],
  modifiedDate: '2026-01-01',
  obsidianUrl: 'obsidian://open?vault=dgw&file=daily%2Fmy-note',
  title: 'My Note Title',
}

const linkedNoteFixture: Note = {
  basename: 'Linked Note',
  titleOrBodyDates: [],
  createdDate: '2026-01-01',
  folder: 'daily',
  frontmatter: null,
  fullPath: '/daily/linked-note.md',
  html: '<p>Linked content</p>',
  id: 'linked-note',
  linkedNotes: [],
  modifiedDate: '2026-01-01',
  obsidianUrl: 'obsidian://open?vault=dgw&file=daily%2Flinked-note',
  title: 'Linked Note Title',
}

const renderCard = (note: Note) =>
  render(
    <ChakraProvider value={defaultSystem}>
      <NotesCard note={note} />
    </ChakraProvider>
  )

beforeEach(() => {
  mutateMock.mockReset()
  useIsReadMock.mockReturnValue({ data: false })
  useToggleNoteReadMock.mockReturnValue({
    isPending: false,
    mutate: mutateMock,
  })
})

describe('NotesCard', () => {
  it('renders the note title and html content', () => {
    renderCard(noteFixture)

    expect(screen.getByText('My Note Title')).toBeTruthy()
    expect(screen.getByText('Hello')).toBeTruthy()
  })

  it('sanitizes unsafe html content', () => {
    renderCard({ ...noteFixture, html: '<p>Safe</p><script>alert(1)</script>' })

    expect(screen.getByText('Safe')).toBeTruthy()
    expect(document.querySelector('script')).toBeNull()
  })

  it('preserves obsidian:// links after sanitization', () => {
    const { container } = renderCard({
      ...noteFixture,
      html: '<a href="obsidian://open?vault=v&file=note">open in obsidian</a>',
    })

    const link = container.querySelector('a[href^="obsidian://"]')
    expect(link).toBeTruthy()
    expect(link?.getAttribute('href')).toBe('obsidian://open?vault=v&file=note')
  })

  it('does not render linked notes section when linkedNotes is empty', () => {
    renderCard({ ...noteFixture, linkedNotes: [] })

    expect(screen.queryByText(/Linked Notes/)).toBeNull()
  })

  it('does not render linked notes section when linkedNotes is undefined', () => {
    renderCard({ ...noteFixture, linkedNotes: undefined } as Note)

    expect(screen.queryByText(/Linked Notes/)).toBeNull()
  })

  it('renders collapsible linked notes trigger when linked notes are present', () => {
    renderCard({ ...noteFixture, linkedNotes: [linkedNoteFixture] })

    expect(screen.getByText('Linked Notes (1)')).toBeTruthy()
  })

  it('renders server-processed task-list icons from html', () => {
    const checkedSvg =
      '<svg class="task-list-icon task-list-icon--checked"><circle cx="12" cy="12" r="10"/></svg>'
    const uncheckedSvg =
      '<svg class="task-list-icon task-list-icon--unchecked"><path d="M10.1 2.182"/></svg>'
    const taskListHtml =
      `<ul class="contains-task-list">` +
      `<li class="task-list-item">${checkedSvg} Done</li>` +
      `<li class="task-list-item">${uncheckedSvg} Todo</li>` +
      `</ul>`

    const { container } = render(
      <ChakraProvider value={defaultSystem}>
        <NotesCard note={{ ...noteFixture, html: taskListHtml }} />
      </ChakraProvider>
    )

    expect(container.querySelector('.task-list-icon--checked')).toBeTruthy()
    expect(container.querySelector('.task-list-icon--unchecked')).toBeTruthy()
    expect(container.querySelector('input[type="checkbox"]')).toBeNull()
  })

  it('collapses the note body when the note is read', () => {
    useIsReadMock.mockReturnValue({ data: true })

    renderCard(noteFixture)

    expect(screen.getByText('My Note Title')).toBeTruthy()
    expect(screen.queryByText('Hello')).toBeNull()
    expect(screen.getByRole('button', { name: 'Mark as unread' })).toBeTruthy()
  })

  it('toggles the note read state from the header button', () => {
    renderCard(noteFixture)

    fireEvent.click(screen.getByRole('button', { name: 'Mark as read' }))

    expect(mutateMock).toHaveBeenCalledTimes(1)
  })
})
