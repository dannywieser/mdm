import { ChakraProvider, defaultSystem } from '@chakra-ui/react'
import { render, screen } from '@testing-library/react'
import type { Note } from 'markdown'
import { describe, expect, it } from 'vitest'

import { OpenInObsidianButton } from './OpenInObsidianButton'

const noteFixture: Note = {
  basename: 'my-note.md',
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
  title: 'My Note',
}

describe('OpenInObsidianButton', () => {
  it('renders a link to the note obsidianUrl', () => {
    render(
      <ChakraProvider value={defaultSystem}>
        <OpenInObsidianButton note={noteFixture} />
      </ChakraProvider>
    )

    const link = screen.getByRole('link', { name: 'Open in Obsidian' })
    expect(link).toBeTruthy()
    expect(link.getAttribute('href')).toBe(noteFixture.obsidianUrl)
  })
})
