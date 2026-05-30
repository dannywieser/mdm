import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import type { Note } from 'markdown'
import { describe, expect, it, vi } from 'vitest'

import { MiniMap } from './MiniMap'

const noteFixtures: Note[] = [
  {
    id: 'note-1',
    title: 'First Entry',
    basename: 'first-entry',
    titleOrBodyDates: [],
    createdDate: '2026-01-01',
    folder: 'daily',
    frontmatter: null,
    fullPath: '/daily/first-entry.md',
    html: '<p>content</p>',
    linkedNotes: [],
    modifiedDate: '2026-01-01',
    obsidianUrl: 'obsidian://open?vault=v&file=first-entry',
  },
  {
    id: 'note-2',
    title: 'Second Entry',
    basename: 'second-entry',
    titleOrBodyDates: [],
    createdDate: '2026-01-01',
    folder: 'daily',
    frontmatter: null,
    fullPath: '/daily/second-entry.md',
    html: '<p>content</p>',
    linkedNotes: [],
    modifiedDate: '2026-01-01',
    obsidianUrl: 'obsidian://open?vault=v&file=second-entry',
  },
]

describe('MiniMap', () => {
  it('renders all note titles', () => {
    render(<MiniMap notes={noteFixtures} onSelect={vi.fn()} />)

    expect(screen.getByText('First Entry')).toBeTruthy()
    expect(screen.getByText('Second Entry')).toBeTruthy()
  })

  it('renders 1-based index for each note', () => {
    render(<MiniMap notes={noteFixtures} onSelect={vi.fn()} />)

    expect(screen.getByText('01')).toBeTruthy()
    expect(screen.getByText('02')).toBeTruthy()
  })

  it('calls onSelect with the note id when a note button is clicked', async () => {
    const onSelect = vi.fn()
    render(<MiniMap notes={noteFixtures} onSelect={onSelect} />)

    await userEvent.click(screen.getByTitle('First Entry'))
    expect(onSelect).toHaveBeenCalledWith('note-1')

    await userEvent.click(screen.getByTitle('Second Entry'))
    expect(onSelect).toHaveBeenCalledWith('note-2')
  })

  it('renders the section header', () => {
    render(<MiniMap notes={noteFixtures} onSelect={vi.fn()} />)

    expect(screen.getByText('── notes')).toBeTruthy()
  })
})
