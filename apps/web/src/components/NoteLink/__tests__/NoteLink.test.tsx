import { ChakraProvider, defaultSystem } from "@chakra-ui/react"
import { cleanup, render, screen } from "@testing-library/react"
import { MemoryRouter } from "react-router-dom"
import { configureDemoMode, resetDemoMode } from "services"
import { afterEach, describe, expect, test } from "vitest"

import { NoteLink } from "../NoteLink"

const note = { id: "my-note", obsidianUrl: "obsidian://open?vault=dgw&file=daily%2Fmy-note" }

const renderLink = () =>
  render(
    <ChakraProvider value={defaultSystem}>
      <MemoryRouter>
        <NoteLink note={note}>My Note</NoteLink>
      </MemoryRouter>
    </ChakraProvider>,
  )

afterEach(() => {
  cleanup()
  resetDemoMode()
})

describe("NoteLink", () => {
  test("links to the note's obsidianUrl outside of demo mode", () => {
    renderLink()

    const link = screen.getByRole("link", { name: "My Note" })
    expect(link.getAttribute("href")).toBe(note.obsidianUrl)
  })

  test("links to the in-app note source route in demo mode", () => {
    configureDemoMode({ dataBasePath: "/demo-data" })

    renderLink()

    const link = screen.getByRole("link", { name: "My Note" })
    expect(link.getAttribute("href")).toBe("/source/my-note")
  })
})
