import { ChakraProvider, defaultSystem } from "@chakra-ui/react"
import { render, screen } from "@testing-library/react"
import { describe, expect, test, vi } from "vitest"

import { Header } from "./Header"

vi.mock("mdm-util", () => ({
  formatDate: () => "2026-06-01",
}))

describe("Header", () => {
  test("renders app name and formatted date", () => {
    render(
      <ChakraProvider value={defaultSystem}>
        <Header />
      </ChakraProvider>,
    )

    expect(screen.getByText("mdm")).toBeTruthy()
    expect(screen.getByText("2026-06-01")).toBeTruthy()
  })
})
