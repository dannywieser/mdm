import { ChakraProvider, defaultSystem } from "@chakra-ui/react"
import { render, screen } from "@testing-library/react"
import { describe, expect, test } from "vitest"

import { MarkdownHeading } from "./MarkdownHeading"

describe("MarkdownHeading", () => {
  test("renders heading level from depth", () => {
    render(
      <ChakraProvider value={defaultSystem}>
        <MarkdownHeading depth={2}>Section</MarkdownHeading>
      </ChakraProvider>,
    )

    expect(screen.getByRole("heading", { level: 2, name: "Section" })).toBeTruthy()
  })

  test("clamps heading depth to h6 maximum", () => {
    render(
      <ChakraProvider value={defaultSystem}>
        <MarkdownHeading depth={999}>Deep</MarkdownHeading>
      </ChakraProvider>,
    )

    expect(screen.getByRole("heading", { level: 6, name: "Deep" })).toBeTruthy()
  })
})
