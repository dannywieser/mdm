import { promises as fsMock } from "node:fs"
import { beforeEach, describe, expect, test, vi } from "vitest"

import { writeVault } from "../writeVault"

vi.mock("node:fs", () => ({
  promises: {
    mkdir: vi.fn().mockResolvedValue(undefined),
    rm: vi.fn().mockResolvedValue(undefined),
    utimes: vi.fn().mockResolvedValue(undefined),
    writeFile: vi.fn().mockResolvedValue(undefined),
  },
}))

const vault = {
  attachments: [
    {
      contents: "<svg/>",
      modifiedDate: "2024-02-02T09:30:00.000Z",
      relativePath: "attachments/covers/books/dune.svg",
    },
  ],
  notes: [
    {
      body: "Hello.",
      folder: "journal",
      frontmatter: { created: "2024-01-01" },
      modifiedDate: "2024-01-01T10:00:00.000Z",
      title: "2024-01-01",
    },
  ],
}

describe("writeVault", () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  test("clears the vault directory before writing", async () => {
    await writeVault(vault, "/vault")

    expect(fsMock.rm).toHaveBeenCalledWith("/vault", {
      force: true,
      recursive: true,
    })
  })

  test("writes notes as markdown files with frontmatter", async () => {
    await writeVault(vault, "/vault")

    expect(fsMock.writeFile).toHaveBeenCalledWith(
      "/vault/journal/2024-01-01.md",
      "---\ncreated: 2024-01-01\n---\n\nHello.\n",
      "utf8",
    )
  })

  test("writes attachments and applies the note modification time", async () => {
    await writeVault(vault, "/vault")

    expect(fsMock.writeFile).toHaveBeenCalledWith(
      "/vault/attachments/covers/books/dune.svg",
      "<svg/>",
      "utf8",
    )
    expect(fsMock.utimes).toHaveBeenCalledWith(
      "/vault/journal/2024-01-01.md",
      new Date("2024-01-01T10:00:00.000Z"),
      new Date("2024-01-01T10:00:00.000Z"),
    )
  })

  test("writes a Buffer attachment (a downloaded photo) as raw bytes with no encoding", async () => {
    const photoBytes = Buffer.from([0xff, 0xd8, 0xff])
    await writeVault(
      {
        attachments: [
          {
            contents: photoBytes,
            modifiedDate: "2024-02-02T09:30:00.000Z",
            relativePath: "attachments/covers/photos/ravine-trail.jpg",
          },
        ],
        notes: [],
      },
      "/vault",
    )

    expect(fsMock.writeFile).toHaveBeenCalledWith(
      "/vault/attachments/covers/photos/ravine-trail.jpg",
      photoBytes,
    )
  })
})
