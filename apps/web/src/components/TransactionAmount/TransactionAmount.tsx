import { Text } from "@chakra-ui/react"

import type { TransactionAmountProps } from "./TransactionAmount.types"

import { formatAmount, resolveAmountColor } from "./TransactionAmount.util"

const FONT_SIZES = { md: "md", sm: "sm", xs: "xs" } as const

export function TransactionAmount({
  amount,
  currency,
  showSign = false,
  size = "sm",
}: Readonly<TransactionAmountProps>) {
  return (
    <Text
      as="span"
      color={resolveAmountColor(amount)}
      fontSize={FONT_SIZES[size]}
      fontVariantNumeric="tabular-nums"
      fontWeight="medium"
      whiteSpace="nowrap"
    >
      {formatAmount(amount, currency, showSign)}
    </Text>
  )
}
