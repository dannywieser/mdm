import { render, screen } from '@testing-library/react'
import type { Note } from 'markdown'
import { describe, expect, it } from 'vitest'

import type { HistoryEntry } from '../types'
import { TerminalOutput } from './TerminalOutput'

const noteFixture: Note = {
  id: 'note-1',
  title: 'Test Note',
  basename: 'test-note',
  titleOrBodyDates: [],
  createdDate: '2026-01-01',
  folder: 'daily',
  frontmatter: null,
  fullPath: '/daily/test-note.md',
  html: '<p>Note body</p>',
  linkedNotes: [],
  modifiedDate: '2026-01-01',
  obsidianUrl: 'obsidian://open?vault=v&file=test-note',
}

describe('TerminalOutput', () => {
  it('renders the loading indicator when isLoading is true', () => {
    render(<TerminalOutput history={[]} isLoading={true} error={null} />)

    expect(screen.getByText('connecting…')).toBeTruthy()
  })

  it('does not render the loading indicator when isLoading is false', () => {
    render(<TerminalOutput history={[]} isLoading={false} error={null} />)

    expect(screen.queryByText('connecting…')).toBeNull()
  })

  it('renders an error message when error is provided', () => {
    render(
      <TerminalOutput
        history={[]}
        isLoading={false}
        error={new Error('fetch failed')}
      />,
    )

    expect(screen.getByText(/fetch failed/)).toBeTruthy()
  })

  it('renders a command echo entry', () => {
    const history: HistoryEntry[] = [{ id: '1', type: 'command', command: 'otd' }]

    render(<TerminalOutput history={history} isLoading={false} error={null} />)

    expect(screen.getByText('otd')).toBeTruthy()
  })

  it('renders help entries with command descriptions', () => {
    const history: HistoryEntry[] = [{ id: '1', type: 'help' }]

    render(<TerminalOutput history={history} isLoading={false} error={null} />)

    expect(screen.getByText("show today's notes")).toBeTruthy()
    expect(screen.getByText('clear the terminal')).toBeTruthy()
    expect(screen.getByText('list available commands')).toBeTruthy()
  })

  it('renders error entry text', () => {
    const history: HistoryEntry[] = [
      { id: '1', type: 'error', errorMessage: 'command not found: foo' },
    ]

    render(<TerminalOutput history={history} isLoading={false} error={null} />)

    expect(screen.getByText('command not found: foo')).toBeTruthy()
  })

  it('renders note blocks for otd entries', () => {
    const history: HistoryEntry[] = [{ id: '1', type: 'otd', notes: [noteFixture] }]

    render(<TerminalOutput history={history} isLoading={false} error={null} />)

    expect(screen.getByText('Test Note')).toBeTruthy()
  })

  it('renders empty state message when otd entry has no notes', () => {
    const history: HistoryEntry[] = [{ id: '1', type: 'otd', notes: [] }]

    render(<TerminalOutput history={history} isLoading={false} error={null} />)

    expect(screen.getByText('no notes found for today')).toBeTruthy()
  })
})
