import { ChakraProvider, defaultSystem } from "@chakra-ui/react"
import { cleanup, fireEvent, render, screen } from "@testing-library/react"
import { afterEach, describe, expect, test } from "vitest"

import { FadeImage } from "../FadeImage"

afterEach(cleanup)

const renderFadeImage = (props: Partial<Parameters<typeof FadeImage>[0]> = {}) =>
  render(
    <ChakraProvider value={defaultSystem}>
      <FadeImage alt="test image" src="/test.jpg" {...props} />
    </ChakraProvider>,
  )

describe("FadeImage", () => {
  test("renders an image with the provided alt and src", () => {
    renderFadeImage()

    const img = screen.getByRole("img", { name: "test image" })
    expect(img).toBeTruthy()
    expect(img.getAttribute("src")).toBe("/test.jpg")
  })

  test("shows a skeleton before the image loads", () => {
    renderFadeImage({ minH: "12" })

    expect(screen.getByTestId("fade-image-skeleton")).toBeTruthy()
  })

  test("hides the skeleton after the image loads", () => {
    renderFadeImage({ minH: "12" })

    fireEvent.load(screen.getByRole("img", { name: "test image" }))

    expect(screen.queryByTestId("fade-image-skeleton")).toBeNull()
  })

  test("hides the skeleton after a load error", () => {
    renderFadeImage({ minH: "12" })

    fireEvent.error(screen.getByRole("img", { name: "test image" }))

    expect(screen.queryByTestId("fade-image-skeleton")).toBeNull()
  })

  test("image remains in the DOM after load", () => {
    renderFadeImage()

    fireEvent.load(screen.getByRole("img", { name: "test image" }))

    expect(screen.getByRole("img", { name: "test image" })).toBeTruthy()
  })

  test("resets to skeleton state when src changes", () => {
    const { rerender } = render(
      <ChakraProvider value={defaultSystem}>
        <FadeImage alt="test image" src="/first.jpg" minH="12" />
      </ChakraProvider>,
    )

    fireEvent.load(screen.getByRole("img", { name: "test image" }))
    expect(screen.queryByTestId("fade-image-skeleton")).toBeNull()

    rerender(
      <ChakraProvider value={defaultSystem}>
        <FadeImage alt="test image" src="/second.jpg" minH="12" />
      </ChakraProvider>,
    )

    expect(screen.getByTestId("fade-image-skeleton")).toBeTruthy()
  })
})
