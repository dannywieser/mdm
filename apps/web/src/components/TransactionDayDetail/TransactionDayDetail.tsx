import { Box, Text, VStack } from "@chakra-ui/react"

import { useI18n } from "../../i18n"
import { TransactionCalendarEntry } from "../TransactionCalendarEntry"

import type { TransactionDayDetailProps } from "./TransactionDayDetail.types"

import { buildAlignProps } from "./TransactionDayDetail.util"

/**
 * A day's transactions in full, shown over the grid on hover or when anything
 * inside gains keyboard focus. The day cell itself only ever shows totals and
 * counts, so this is where the individual entries live.
 *
 * It stays in the DOM rather than mounting on hover so the entry links remain
 * tabbable — tabbing into one reveals the panel it sits in. The cell it is
 * positioned against must carry Chakra's `group` class, and `align` keeps the
 * panel on the page for cells at the edges of the grid.
 */
export function TransactionDayDetail({ align, currency, day }: Readonly<TransactionDayDetailProps>) {
  const { t } = useI18n()

  return (
    <Box
      position="absolute"
      top="100%"
      minW="240px"
      maxW="320px"
      mt={1}
      opacity={0}
      pointerEvents="none"
      transition="opacity 0.15s"
      {...buildAlignProps(align)}
      zIndex="popover"
      _groupFocusWithin={{ opacity: 1, pointerEvents: "auto" }}
      _groupHover={{ opacity: 1, pointerEvents: "auto" }}
    >
      <VStack
        align="stretch"
        backgroundColor="app.panelBackground"
        borderColor="app.border"
        borderRadius="md"
        borderWidth="1px"
        boxShadow="lg"
        gap={1}
        px={2}
        py={1.5}
      >
        <Text color="app.textMuted" fontSize="xs" fontWeight="medium">
          {t("calendar.dayDetailTitle", { date: day.date })}
        </Text>
        {day.transactions.map((transaction) => (
          <TransactionCalendarEntry
            key={transaction.id}
            currency={currency}
            transaction={transaction}
          />
        ))}
      </VStack>
    </Box>
  )
}
