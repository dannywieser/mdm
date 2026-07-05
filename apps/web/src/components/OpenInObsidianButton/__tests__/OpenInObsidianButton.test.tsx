import { ChakraProvider, defaultSystem } from '@chakra-ui/react'
import { cleanup, render, screen } from '@testing-library/react'
import type { Note } from 'markdown'
import { MemoryRouter } from 'react-router-dom'
import { configureDemoMode, resetDemoMode } from 'services'
import { afterEach, describe, expect, test } from 'vitest'

import { OpenInObsidianButton } from '../OpenInObsidianButton'

const noteFixture: Note = {
  basename: 'my-note.md',
  dates: [],
  createdDate: '2026-01-01',
  content: {
    children: [{ children: [{ type: 'text', value: 'Hello' }], type: 'paragraph' }],
    type: 'root',
  },
  folder: 'daily',
  frontmatter: null,
  fullPath: '/daily/my-note.md',
  fullText: '',
  id: 'my-note',
  linkedNotes: [],
  modifiedDate: '2026-01-01',
  obsidianUrl: 'obsidian://open?vault=dgw&file=daily%2Fmy-note',
  title: 'My Note',
}

const renderButton = () =>
  render(
    <ChakraProvider value={defaultSystem}>
      <MemoryRouter>
        <OpenInObsidianButton note={noteFixture} />
      </MemoryRouter>
    </ChakraProvider>
  )

afterEach(() => {
  cleanup()
  resetDemoMode()
})

describe('OpenInObsidianButton', () => {
  test('renders a link to the note obsidianUrl', () => {
    renderButton()

    const link = screen.getByRole('link', { name: 'Open in Obsidian' })
    expect(link).toBeTruthy()
    expect(link.getAttribute('href')).toBe(noteFixture.obsidianUrl)
  })

  test('links to the in-app note source page in demo mode', () => {
    configureDemoMode({ dataBasePath: '/demo-data' })

    renderButton()

    const link = screen.getByRole('link', { name: 'View note source' })
    expect(link.getAttribute('href')).toBe('/source/my-note')
    expect(screen.queryByRole('link', { name: 'Open in Obsidian' })).toBeNull()
  })
})
