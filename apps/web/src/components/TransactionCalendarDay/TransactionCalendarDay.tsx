import { Box, Flex, HStack, Text, VStack } from "@chakra-ui/react"
import type { ReactNode } from "react"
import { ArrowDownRight, ArrowUpRight, Repeat } from "lucide-react"

import { useI18n } from "../../i18n"
import { TransactionAmount } from "../TransactionAmount"
import { TransactionDayDetail } from "../TransactionDayDetail"
import { resolveDetailAlign } from "../TransactionDayDetail/TransactionDayDetail.util"

import type { TransactionCalendarDayProps } from "./TransactionCalendarDay.types"

/** Every cell is this tall regardless of how much falls on the day. */
const CELL_HEIGHT = { base: "76px", md: "96px" }

const COUNT_ICON_SIZE = 11

/**
 * One day block of the month grid, summarised so the cell never changes size:
 * the day's logged and scheduled totals, then a count of money out and money
 * in rather than a row per transaction. The transactions themselves live in
 * `TransactionDayDetail`, revealed on hover or keyboard focus.
 *
 * Padding days from the neighbouring months are dimmed rather than hidden so
 * each week row stays a complete seven-column strip.
 */
export function TransactionCalendarDay({ currency, day }: Readonly<TransactionCalendarDayProps>) {
  const { t } = useI18n()
  const hasTransactions = day.transactions.length > 0

  return (
    <Box
      as="li"
      className="group"
      backgroundColor={day.isCurrentMonth ? "app.panelBackground" : "app.background"}
      borderColor={day.isToday ? "app.accent" : "app.border"}
      borderRadius="md"
      borderWidth={day.isToday ? "2px" : "1px"}
      h={CELL_HEIGHT}
      listStyleType="none"
      opacity={day.isCurrentMonth ? 1 : 0.45}
      p={1.5}
      position="relative"
    >
      <VStack align="stretch" gap={0.5} h="full">
        <Flex alignItems="baseline" gap={1} justifyContent="space-between">
          <Text
            color={day.isToday ? "app.accent" : "app.textMuted"}
            fontSize="xs"
            fontWeight={day.isToday ? "bold" : "medium"}
          >
            {day.isToday ? t("calendar.today", { day: day.dayOfMonth }) : day.dayOfMonth}
          </Text>
          <VStack align="flex-end" gap={0}>
            {day.loggedTotal !== 0 && (
              <TransactionAmount amount={day.loggedTotal} currency={currency} showSign size="xs" />
            )}
            {day.scheduledTotal !== 0 && (
              <HStack
                aria-label={t("calendar.status.scheduled")}
                color="app.textMuted"
                gap={0.5}
                title={t("calendar.status.scheduled")}
              >
                <Repeat size={9} />
                <TransactionAmount
                  amount={day.scheduledTotal}
                  currency={currency}
                  showSign
                  size="xs"
                />
              </HStack>
            )}
          </VStack>
        </Flex>

        {hasTransactions && (
          <HStack gap={2} mt="auto">
            {day.expenseCount > 0 && (
              <CountChip
                color="app.negativeText"
                count={day.expenseCount}
                icon={<ArrowDownRight size={COUNT_ICON_SIZE} />}
                label={t("calendar.expenseCount", { count: day.expenseCount })}
              />
            )}
            {day.incomeCount > 0 && (
              <CountChip
                color="app.positiveText"
                count={day.incomeCount}
                icon={<ArrowUpRight size={COUNT_ICON_SIZE} />}
                label={t("calendar.incomeCount", { count: day.incomeCount })}
              />
            )}
          </HStack>
        )}
      </VStack>

      {hasTransactions && (
        <TransactionDayDetail
          align={resolveDetailAlign(day.date)}
          currency={currency}
          day={day}
        />
      )}
    </Box>
  )
}

function CountChip({
  color,
  count,
  icon,
  label,
}: Readonly<{ color: string; count: number; icon: ReactNode; label: string }>) {
  return (
    <HStack aria-label={label} color={color} gap={0.5} title={label}>
      <Text as="span" aria-hidden="true" lineHeight={0}>
        {icon}
      </Text>
      <Text as="span" fontSize="xs" fontVariantNumeric="tabular-nums" fontWeight="medium">
        {count}
      </Text>
    </HStack>
  )
}
