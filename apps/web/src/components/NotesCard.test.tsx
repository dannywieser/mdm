import { ChakraProvider, defaultSystem } from '@chakra-ui/react'
import { render, screen } from '@testing-library/react'
import type { Note } from 'markdown'
import { describe, expect, it } from 'vitest'

import { NotesCard } from './NotesCard'

const noteFixture: Note = {
  basename: 'My Note',
  titleOrBodyDates: [],
  createdDate: '2026-01-01',
  folder: 'daily',
  frontmatter: null,
  fullPath: '/daily/my-note.md',
  html: '<p>Hello</p>',
  id: 'my-note',
  modifiedDate: '2026-01-01',
  obsidianUrl: 'obsidian://open?vault=dgw&file=daily%2Fmy-note',
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
})
