import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import type { Note } from 'markdown'
import { describe, expect, it, vi } from 'vitest'

import { Terminal } from './Terminal'

const noteFixtures: Note[] = [
  {
    id: 'note-1',
    title: 'Journal 2026-01-15',
    basename: 'journal',
    titleOrBodyDates: [],
    createdDate: '2026-01-15',
    folder: 'daily',
    frontmatter: null,
    fullPath: '/daily/journal.md',
    html: '<p>Some content</p>',
    linkedNotes: [],
    modifiedDate: '2026-01-15',
    obsidianUrl: 'obsidian://open?vault=v&file=journal',
  },
]

const useNotesQueryMock = vi.fn()

vi.mock('../../../hooks/useNotesQuery', () => ({
  useNotesQuery: () => useNotesQueryMock(),
}))

describe('Terminal', () => {
  it('renders loading state while notes are fetching', () => {
    useNotesQueryMock.mockReturnValue({ data: undefined, error: null, isLoading: true })

    render(<Terminal />)

    expect(screen.getByRole('img', { name: 'connecting…' })).toBeTruthy()
  })

  it('renders error message when the query fails', () => {
    useNotesQueryMock.mockReturnValue({
      data: undefined,
      error: new Error('network failure'),
      isLoading: false,
    })

    render(<Terminal />)

    expect(screen.getByText(/network failure/)).toBeTruthy()
  })

  it('auto-runs otd and shows note titles when data loads', async () => {
    useNotesQueryMock.mockReturnValue({
      data: { notes: noteFixtures, notesDirectory: '/notes', obsidianVault: 'v', headerDateFormat: 'YYYY.MM.DD (ddd)' },
      error: null,
      isLoading: false,
    })

    render(<Terminal />)

    // The note title appears in both the output block and the mini-map
    await waitFor(() =>
      expect(screen.getAllByText('Journal 2026-01-15').length).toBeGreaterThan(0),
    )
    expect(screen.getAllByText('otd').length).toBeGreaterThan(0)
  })

  it('renders the mini-map after notes load', async () => {
    useNotesQueryMock.mockReturnValue({
      data: { notes: noteFixtures, notesDirectory: '/notes', obsidianVault: 'v', headerDateFormat: 'YYYY.MM.DD (ddd)' },
      error: null,
      isLoading: false,
    })

    render(<Terminal />)

    await waitFor(() =>
      expect(screen.getByRole('complementary', { name: 'Note navigation' })).toBeTruthy(),
    )
  })

  it('shows help output when the help command is submitted', async () => {
    useNotesQueryMock.mockReturnValue({
      data: { notes: noteFixtures, notesDirectory: '/notes', obsidianVault: 'v', headerDateFormat: 'YYYY.MM.DD (ddd)' },
      error: null,
      isLoading: false,
    })

    render(<Terminal />)

    const input = screen.getByRole('textbox', { name: /terminal input/i })
    await userEvent.type(input, 'help{enter}')

    await waitFor(() => expect(screen.getByText("show today's notes")).toBeTruthy())
    expect(screen.getByText('list available commands')).toBeTruthy()
  })

  it('shows error line for unknown commands', async () => {
    useNotesQueryMock.mockReturnValue({
      data: { notes: noteFixtures, notesDirectory: '/notes', obsidianVault: 'v', headerDateFormat: 'YYYY.MM.DD (ddd)' },
      error: null,
      isLoading: false,
    })

    render(<Terminal />)

    const input = screen.getByRole('textbox', { name: /terminal input/i })
    await userEvent.type(input, 'foobar{enter}')

    await waitFor(() =>
      expect(screen.getByText('command not found: foobar')).toBeTruthy(),
    )
  })

  it('clears the terminal output when clear is submitted', async () => {
    useNotesQueryMock.mockReturnValue({
      data: { notes: noteFixtures, notesDirectory: '/notes', obsidianVault: 'v', headerDateFormat: 'YYYY.MM.DD (ddd)' },
      error: null,
      isLoading: false,
    })

    render(<Terminal />)

    // wait for auto-run to populate history
    await waitFor(() =>
      expect(screen.getAllByText('Journal 2026-01-15').length).toBeGreaterThan(0),
    )

    const input = screen.getByRole('textbox', { name: /terminal input/i })
    await userEvent.type(input, 'clear{enter}')

    await waitFor(() =>
      expect(screen.queryAllByText('Journal 2026-01-15')).toHaveLength(0),
    )
  })

  it('sets document title to "mdm | otd" after auto-run', async () => {
    useNotesQueryMock.mockReturnValue({
      data: { notes: noteFixtures, notesDirectory: '/notes', obsidianVault: 'v', headerDateFormat: 'YYYY.MM.DD (ddd)' },
      error: null,
      isLoading: false,
    })

    render(<Terminal />)

    await waitFor(() => expect(document.title).toBe('mdm | otd'))
  })

  it('updates document title to "mdm | help" when help is run', async () => {
    useNotesQueryMock.mockReturnValue({
      data: { notes: noteFixtures, notesDirectory: '/notes', obsidianVault: 'v', headerDateFormat: 'YYYY.MM.DD (ddd)' },
      error: null,
      isLoading: false,
    })

    render(<Terminal />)

    const input = screen.getByRole('textbox', { name: /terminal input/i })
    await userEvent.type(input, 'help{enter}')

    await waitFor(() => expect(document.title).toBe('mdm | help'))
  })

  it('resets document title to "mdm" when clear is run', async () => {
    useNotesQueryMock.mockReturnValue({
      data: { notes: noteFixtures, notesDirectory: '/notes', obsidianVault: 'v', headerDateFormat: 'YYYY.MM.DD (ddd)' },
      error: null,
      isLoading: false,
    })

    render(<Terminal />)

    await waitFor(() => expect(document.title).toBe('mdm | otd'))

    const input = screen.getByRole('textbox', { name: /terminal input/i })
    await userEvent.type(input, 'clear{enter}')

    await waitFor(() => expect(document.title).toBe('mdm'))
  })

  it('renders the mdm header with date', () => {
    useNotesQueryMock.mockReturnValue({ data: undefined, error: null, isLoading: true })

    render(<Terminal />)

    expect(screen.getByText('mdm')).toBeTruthy()
  })
})
