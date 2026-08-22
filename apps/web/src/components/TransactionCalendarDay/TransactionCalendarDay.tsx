import { Box, Flex, Text, VStack } from "@chakra-ui/react"

import { useI18n } from "../../i18n"
import { TransactionAmount } from "../TransactionAmount"
import { TransactionCalendarEntry } from "../TransactionCalendarEntry"

import type { TransactionCalendarDayProps } from "./TransactionCalendarDay.types"

/**
 * One day block of the month grid: the day number, that day's net total when
 * anything falls on it, and the day's transactions listed in full. Padding
 * days from the neighbouring months are dimmed rather than hidden so each
 * week row stays a complete seven-column strip.
 */
export function TransactionCalendarDay({ currency, day }: Readonly<TransactionCalendarDayProps>) {
  const { t } = useI18n()

  return (
    <Box
      as="li"
      backgroundColor={day.isCurrentMonth ? "app.panelBackground" : "app.background"}
      borderColor={day.isToday ? "app.accent" : "app.border"}
      borderRadius="md"
      borderWidth={day.isToday ? "2px" : "1px"}
      listStyleType="none"
      minH={{ base: "auto", md: "120px" }}
      opacity={day.isCurrentMonth ? 1 : 0.45}
      p={1.5}
    >
      <VStack align="stretch" gap={1} h="full">
        <Flex alignItems="baseline" gap={1} justifyContent="space-between">
          <Text
            color={day.isToday ? "app.accent" : "app.textMuted"}
            fontSize="xs"
            fontWeight={day.isToday ? "bold" : "medium"}
          >
            {day.isToday ? t("calendar.today", { day: day.dayOfMonth }) : day.dayOfMonth}
          </Text>
          {day.transactions.length > 0 && (
            <TransactionAmount amount={day.total} currency={currency} showSign size="xs" />
          )}
        </Flex>
        <VStack align="stretch" gap="1px">
          {day.transactions.map((transaction) => (
            <TransactionCalendarEntry
              key={transaction.id}
              currency={currency}
              transaction={transaction}
            />
          ))}
        </VStack>
      </VStack>
    </Box>
  )
}
