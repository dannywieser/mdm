import { Box, Flex, HStack, Text, VStack, chakra } from "@chakra-ui/react"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { toISODateString } from "mdm-util"
import { Link, useParams } from "react-router-dom"
import { useTransactionsQuery } from "services"

import { useI18n } from "../../i18n"
import { focusRing } from "../../theme/focusRing"
import { TransactionAmount } from "../TransactionAmount"
import { TransactionCalendarDay } from "../TransactionCalendarDay"

import { buildCalendarWeeks, formatMonthLabel, resolveMonthKey, shiftMonth } from "./TransactionCalendar.util"

const RouterLink = chakra(Link)

const WEEKDAY_LABELS = ["sun", "mon", "tue", "wed", "thu", "fri", "sat"] as const
const GRID_COLUMNS = { base: "1fr", md: "repeat(7, minmax(0, 1fr))" }

function MonthStep({ label, monthKey, children }: Readonly<{
  children: React.ReactNode
  label: string
  monthKey: string
}>) {
  return (
    <RouterLink
      to={`/calendar/${monthKey}`}
      aria-label={label}
      alignItems="center"
      borderRadius="md"
      color="app.text"
      display="flex"
      justifyContent="center"
      p={1.5}
      _hover={{ bg: "app.panelBackgroundHover" }}
      transition="background 0.15s"
      {...focusRing}
    >
      {children}
    </RouterLink>
  )
}

/**
 * Month-at-a-time transaction calendar. The month lives in the route so a
 * given month is linkable and the browser's back button steps through the
 * months already visited; paging is just a link to the neighbouring month,
 * which the service resolves however far ahead it is asked for.
 */
export function TransactionCalendar() {
  const { t } = useI18n()
  const { month } = useParams<{ month?: string }>()
  // The viewer's own calendar date, so "today" highlights the right cell.
  const today = toISODateString(new Date())
  const monthKey = resolveMonthKey(month, today)
  const { data } = useTransactionsQuery({ month: monthKey })
  const weeks = buildCalendarWeeks(monthKey, data.transactions, today)

  return (
    <VStack align="stretch" gap={4} pt={6} pb={16} px={{ base: 2, md: 6 }}>
      <Flex alignItems="center" flexWrap="wrap" gap={3} justifyContent="space-between">
        <HStack gap={1}>
          <MonthStep label={t("calendar.previousMonth")} monthKey={shiftMonth(monthKey, -1)}>
            <ChevronLeft size={20} />
          </MonthStep>
          <Text color="app.text" fontSize="lg" fontWeight="semibold" minW="180px" textAlign="center">
            {formatMonthLabel(monthKey)}
          </Text>
          <MonthStep label={t("calendar.nextMonth")} monthKey={shiftMonth(monthKey, 1)}>
            <ChevronRight size={20} />
          </MonthStep>
          <RouterLink
            to="/calendar"
            borderRadius="md"
            color="app.textMuted"
            fontSize="xs"
            px={2}
            py={1}
            _hover={{ bg: "app.panelBackgroundHover", color: "app.text" }}
            transition="background 0.15s, color 0.15s"
            {...focusRing}
          >
            {t("calendar.thisMonth")}
          </RouterLink>
        </HStack>

        <HStack gap={4}>
          <MonthTotal label={t("calendar.income")} amount={data.totals.income} currency={data.currency} />
          <MonthTotal label={t("calendar.expenses")} amount={data.totals.expense} currency={data.currency} />
          <MonthTotal label={t("calendar.net")} amount={data.totals.net} currency={data.currency} />
        </HStack>
      </Flex>

      <Box display="grid" gap={1} gridTemplateColumns={GRID_COLUMNS} aria-hidden="true">
        {WEEKDAY_LABELS.map((label) => (
          <Text
            key={label}
            color="app.textMuted"
            display={{ base: "none", md: "block" }}
            fontSize="xs"
            fontWeight="medium"
            textAlign="center"
          >
            {t(`calendar.weekday.${label}`)}
          </Text>
        ))}
      </Box>

      {/* One grid of day cells rather than a row per week: the seven columns
          already lay the weeks out, and it keeps the list markup flat. */}
      <Box as="ul" display="grid" gap={1} gridTemplateColumns={GRID_COLUMNS} listStyleType="none">
        {weeks.flatMap((week) => week.days).map((day) => (
          <TransactionCalendarDay key={day.date} currency={data.currency} day={day} />
        ))}
      </Box>
    </VStack>
  )
}

function MonthTotal({ amount, currency, label }: Readonly<{
  amount: number
  currency: string
  label: string
}>) {
  return (
    <VStack align="flex-end" gap={0}>
      <Text color="app.textMuted" fontSize="10px" letterSpacing="wide" textTransform="uppercase">
        {label}
      </Text>
      <TransactionAmount amount={amount} currency={currency} showSign size="sm" />
    </VStack>
  )
}
