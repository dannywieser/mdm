import { ChakraProvider, defaultSystem } from "@chakra-ui/react"
import { cleanup, render, screen } from "@testing-library/react"
import { afterEach, describe, expect, test } from "vitest"

import { LoadingScreen } from "../LoadingScreen"

afterEach(() => {
  cleanup()
})

describe("LoadingScreen", () => {
  test("renders the notebook SVG", () => {
    render(
      <ChakraProvider value={defaultSystem}>
        <LoadingScreen />
      </ChakraProvider>,
    )

    expect(screen.getByRole("img", { name: "Notebook" })).toBeTruthy()
  })

  test("renders with loading screen test id", () => {
    render(
      <ChakraProvider value={defaultSystem}>
        <LoadingScreen />
      </ChakraProvider>,
    )

    expect(screen.getByTestId("loading-screen")).toBeTruthy()
  })
})
