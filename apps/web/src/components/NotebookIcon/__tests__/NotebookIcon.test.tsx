import { ChakraProvider, defaultSystem } from "@chakra-ui/react"
import { render } from "@testing-library/react"
import { describe, expect, test } from "vitest"

import { NotebookIcon } from "../NotebookIcon"

describe("NotebookIcon", () => {
  test("renders svg role with provided label", () => {
    const { container } = render(
      <ChakraProvider value={defaultSystem}>
        <NotebookIcon ariaLabel="Loading notebook" />
      </ChakraProvider>,
    )
    const svg = container.querySelector("svg")

    expect(svg?.getAttribute("aria-label")).toBe("Loading notebook")
    expect(svg?.getAttribute("role")).toBe("img")
  })

  test("applies animation style classes only when animating is true", () => {
    const { container: animatingContainer } = render(
      <ChakraProvider value={defaultSystem}>
        <NotebookIcon animating={true} />
      </ChakraProvider>,
    )
    const animatingSvg = animatingContainer.querySelector("svg")
    const animatingRect = animatingContainer.querySelector("rect")

    expect(animatingSvg?.getAttribute("class")).not.toContain("notebook-loader")
    expect(animatingRect?.getAttribute("class")).toBeTruthy()

    const { container: staticContainer } = render(
      <ChakraProvider value={defaultSystem}>
        <NotebookIcon animating={false} />
      </ChakraProvider>,
    )
    const staticRect = staticContainer.querySelector("rect")

    expect(staticRect?.getAttribute("class")).toBeNull()
  })

  test("uses default aria label", () => {
    const { container } = render(
      <ChakraProvider value={defaultSystem}>
        <NotebookIcon />
      </ChakraProvider>,
    )
    const svg = container.querySelector("svg")

    expect(svg?.getAttribute("aria-label")).toBe("Notebook")
  })
})
