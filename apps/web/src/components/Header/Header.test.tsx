import { ChakraProvider, defaultSystem } from "@chakra-ui/react"
import { cleanup, render, screen } from "@testing-library/react"
import { afterEach, describe, expect, test, vi } from "vitest"

import { Header } from "./Header"

vi.mock("mdm-util", () => ({
  formatDate: () => "2026-06-01",
}))

const usePageTitleMock = vi.fn()

vi.mock("../../context/PageTitle/usePageTitle", () => ({
  usePageTitle: () => usePageTitleMock(),
}))

afterEach(() => {
  cleanup()
})

const renderComponent = () =>
  render(
    <ChakraProvider value={defaultSystem}>
      <Header />
    </ChakraProvider>,
  )

describe("Header", () => {
  test("renders app name and formatted date", () => {
    usePageTitleMock.mockReturnValue({ title: "", setTitle: vi.fn() })

    renderComponent()

    expect(screen.getByText("mdm")).toBeTruthy()
    expect(screen.getByText("2026-06-01")).toBeTruthy()
  })

  test("renders page title alongside app name when set", () => {
    usePageTitleMock.mockReturnValue({ title: "My Note", setTitle: vi.fn() })

    renderComponent()

    expect(screen.getByText("mdm")).toBeTruthy()
    expect(screen.getByText("> My Note")).toBeTruthy()
  })

  test("does not render page title when empty", () => {
    usePageTitleMock.mockReturnValue({ title: "", setTitle: vi.fn() })

    renderComponent()

    expect(screen.queryByText("My Note")).toBeNull()
  })
})
