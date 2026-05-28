import { ChakraProvider, defaultSystem } from '@chakra-ui/react'
import { render, screen } from '@testing-library/react'
import type { Note } from 'markdown'
import { describe, expect, it } from 'vitest'

import { NotesCard } from './NotesCard'

const noteFixture: Note = {
  basename: 'My Note',
  bodyDates: [],
  createdDate: '2026-01-01',
  folder: 'daily',
  frontmatter: null,
  fullPath: '/daily/my-note.md',
  html: '<p>Hello</p>',
  id: 'my-note',
  modifiedDate: '2026-01-01',
  title: 'My Note Title'
}

describe('NotesCard', () => {
  it('renders the note title and html content', () => {
    render(
      <ChakraProvider value={defaultSystem}>
        <NotesCard note={noteFixture} />
      </ChakraProvider>
    )

    expect(screen.getByText('My Note Title')).toBeTruthy()
    expect(screen.getByText('Hello')).toBeTruthy()
  })

  it('sanitizes unsafe html content', () => {
    render(
      <ChakraProvider value={defaultSystem}>
        <NotesCard note={{ ...noteFixture, html: '<p>Safe</p><script>alert(1)</script>' }} />
      </ChakraProvider>
    )

    expect(screen.getByText('Safe')).toBeTruthy()
    expect(document.querySelector('script')).toBeNull()
  })
})
