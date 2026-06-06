import { ChakraProvider, defaultSystem } from "@chakra-ui/react"
import { cleanup, fireEvent, render, screen } from "@testing-library/react"
import { afterEach, describe, expect, test } from "vitest"

import { FadeImage } from "./FadeImage"

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

  test("shows a skeleton without minH before load", () => {
    renderFadeImage()

    expect(screen.getByTestId("fade-image-skeleton")).toBeTruthy()
  })

  test("image remains in the DOM after load", () => {
    renderFadeImage()

    fireEvent.load(screen.getByRole("img", { name: "test image" }))

    expect(screen.getByRole("img", { name: "test image" })).toBeTruthy()
  })
})
