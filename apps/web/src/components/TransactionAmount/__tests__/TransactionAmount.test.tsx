import { ChakraProvider, defaultSystem } from "@chakra-ui/react"
import { cleanup, render, screen } from "@testing-library/react"
import { afterEach, describe, expect, test, vi } from "vitest"

import { TransactionAmount } from "../TransactionAmount"
import { formatAmount, resolveAmountColor } from "../TransactionAmount.util"

vi.mock("../TransactionAmount.util", () => ({
  formatAmount: vi.fn(() => "FORMATTED"),
  resolveAmountColor: vi.fn(() => "app.negativeText"),
}))

afterEach(cleanup)

const renderAmount = (props: Partial<Parameters<typeof TransactionAmount>[0]> = {}) =>
  render(
    <ChakraProvider value={defaultSystem}>
      <TransactionAmount amount={-42.5} currency="USD" {...props} />
    </ChakraProvider>,
  )

describe("TransactionAmount", () => {
  test("renders the formatted value from the util", () => {
    renderAmount()

    expect(screen.getByText("FORMATTED")).toBeTruthy()
  })

  test("formats without a sign by default", () => {
    renderAmount()

    expect(vi.mocked(formatAmount)).toHaveBeenCalledWith(-42.5, "USD", false)
  })

  test("passes the sign flag through when asked to show it", () => {
    renderAmount({ showSign: true })

    expect(vi.mocked(formatAmount)).toHaveBeenCalledWith(-42.5, "USD", true)
  })

  test("colours the value using the util's token", () => {
    renderAmount()

    expect(vi.mocked(resolveAmountColor)).toHaveBeenCalledWith(-42.5)
  })
})
