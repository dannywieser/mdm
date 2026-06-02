import { ChakraProvider, defaultSystem } from "@chakra-ui/react"
import { render, screen } from "@testing-library/react"
import { describe, expect, test } from "vitest"

import { AppError } from "./AppError"

describe("AppError", () => {
  test("renders the error message", () => {
    render(
      <ChakraProvider value={defaultSystem}>
        <AppError message="Something went wrong" />
      </ChakraProvider>,
    )

    expect(screen.getByText("Something went wrong")).toBeTruthy()
  })

  test("renders the bug icon", () => {
    const { container } = render(
      <ChakraProvider value={defaultSystem}>
        <AppError message="error" />
      </ChakraProvider>,
    )

    expect(container.querySelector("svg")).toBeTruthy()
  })
})
