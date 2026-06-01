import { render, screen } from "@testing-library/react"
import { describe, expect, test } from "vitest"

import { NotebookIcon } from "./NotebookIcon"

describe("NotebookIcon", () => {
  test("renders svg role with provided label", () => {
    render(<NotebookIcon ariaLabel="Loading notebook" />)

    expect(screen.getByRole("img", { name: "Loading notebook" })).toBeTruthy()
  })
})
