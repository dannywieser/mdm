import type { MarkdownNode } from "markdown"

import { ChakraProvider, defaultSystem } from "@chakra-ui/react"
import { render } from "@testing-library/react"
import { describe, expect, test } from "vitest"

import { MarkdownTree } from "../MarkdownTree"

const renderTree = (content: MarkdownNode) =>
  render(
    <ChakraProvider value={defaultSystem}>
      <MarkdownTree content={content} />
    </ChakraProvider>,
  )

describe("MarkdownTree", () => {
  test("renders line breaks within a paragraph's text content", () => {
    const content: MarkdownNode = {
      type: "root",
      children: [
        {
          type: "paragraph",
          children: [{ type: "text", value: "a\nb\nc" }],
        },
      ],
    }

    const { container } = renderTree(content)

    expect(container.querySelectorAll("br")).toHaveLength(2)
    expect(container.textContent).toBe("abc")
  })
})
