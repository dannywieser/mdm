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

  it('applies terminal-minimap--open class when isOpen is true', () => {
    render(<MiniMap isOpen={true} notes={noteFixtures} onSelect={vi.fn()} />)

    expect(document.querySelector('.terminal-minimap--open')).toBeTruthy()
  })

  it('does not apply terminal-minimap--open class when isOpen is false', () => {
    render(<MiniMap isOpen={false} notes={noteFixtures} onSelect={vi.fn()} />)

    expect(document.querySelector('.terminal-minimap--open')).toBeNull()
  })

  it('renders the close button when onClose is provided', () => {
    render(<MiniMap notes={noteFixtures} onClose={vi.fn()} onSelect={vi.fn()} />)

    expect(screen.getByRole('button', { name: 'close notes' })).toBeTruthy()
  })

  it('does not render the close button when onClose is not provided', () => {
    render(<MiniMap notes={noteFixtures} onSelect={vi.fn()} />)

    expect(screen.queryByRole('button', { name: 'close notes' })).toBeNull()
  })

  it('calls onClose when the close button is clicked', async () => {
    const onClose = vi.fn()
    render(<MiniMap notes={noteFixtures} onClose={onClose} onSelect={vi.fn()} />)

    await userEvent.click(screen.getByRole('button', { name: 'close notes' }))

    expect(onClose).toHaveBeenCalledTimes(1)
  })
})
