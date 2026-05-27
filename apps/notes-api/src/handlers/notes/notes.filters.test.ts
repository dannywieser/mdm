import { applyViewFilter } from "./notes.filters"

describe("notes filter helpers", () => {
  test("applyViewFilter returns all notes when no view is requested", () => {
    const notes = [createMockNote("book.md"), createMockNote("movie.md")]

    const filtered = applyViewFilter(notes, [], undefined)

    expect(filtered).toEqual(notes)
  })

  test("applyViewFilter filters notes using configured view filters", () => {
    const notes = [
      createMockNote("book.md", {
        folder: "downtime",
        frontmatter: {
          topic: ["Reading"],
          type: "book"
        }
      }),
      createMockNote("movie.md", {
        folder: "downtime",
        frontmatter: {
          type: "movie"
        }
      }),
      createMockNote("todo.md", {
        folder: "work",
        frontmatter: {
          type: "book"
        }
      })
    ]

    const filtered = applyViewFilter(
      notes,
      [
        {
          filters: {
            folder: "downtime",
            "frontmatter.type": "book"
          },
          name: "books"
        }
      ],
      "books"
    )

    expect(filtered).toEqual([notes[0]])
  })

  test("applyViewFilter supports array frontmatter values", () => {
    const notes = [
      createMockNote("read.md", {
        frontmatter: {
          topic: ["Reading", "AI"]
        }
      }),
      createMockNote("write.md", {
        frontmatter: {
          topic: ["Writing"]
        }
      })
    ]

    const filtered = applyViewFilter(
      notes,
      [
        {
          filters: {
            "frontmatter.topic": "Reading"
          },
          name: "reading"
        }
      ],
      "reading"
    )

    expect(filtered).toEqual([notes[0]])
  })

  test("applyViewFilter returns all notes when view name is not configured", () => {
    const notes = [createMockNote("book.md"), createMockNote("movie.md")]

    const filtered = applyViewFilter(
      notes,
      [
        {
          filters: {
            folder: "downtime"
          },
          name: "books"
        }
      ],
      "missing"
    )

    expect(filtered).toEqual(notes)
  })
})

const createMockNote = (
  basename: string,
  overrides: Partial<ReturnType<typeof defaultMockNote>> = {}
): ReturnType<typeof defaultMockNote> => ({
  ...defaultMockNote(basename),
  ...overrides
})

const defaultMockNote = (basename: string) => ({
  basename,
  bodyDates: [],
  createdDate: "2026-05-26T00:00:00.000Z",
  folder: "notes",
  frontmatter: null,
  fullPath: `/notes/${basename}`,
  html: "<h1>Note</h1>",
  id: basename.replace(/\.[^.]+$/, ""),
  modifiedDate: "2026-05-26T01:00:00.000Z"
})
