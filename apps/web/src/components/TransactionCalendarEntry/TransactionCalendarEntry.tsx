import { Flex, Text, chakra } from "@chakra-ui/react"
import { Repeat } from "lucide-react"
import { Link } from "react-router-dom"

import { useI18n } from "../../i18n"
import { focusRing } from "../../theme/focusRing"
import { TransactionAmount } from "../TransactionAmount"

import type { TransactionCalendarEntryProps } from "./TransactionCalendarEntry.types"

const RouterLink = chakra(Link)

/**
 * A single transaction inside a day cell. Scheduled entries are marked with a
 * repeat icon and a dashed edge so a projected occurrence is never mistaken
 * for one that actually happened.
 */
export function TransactionCalendarEntry({
  currency,
  transaction,
}: Readonly<TransactionCalendarEntryProps>) {
  const { t } = useI18n()
  const isScheduled = transaction.status === "scheduled"

  return (
    <RouterLink
      to={`/source/${encodeURIComponent(transaction.noteId)}`}
      aria-label={t("calendar.entryLabel", {
        description: transaction.description,
        status: t(`calendar.status.${transaction.status}`),
      })}
      alignItems="center"
      borderRadius="sm"
      borderLeftWidth="2px"
      borderLeftStyle={isScheduled ? "dashed" : "solid"}
      borderLeftColor={transaction.amount < 0 ? "app.negativeText" : "app.positiveText"}
      display="flex"
      gap={1}
      justifyContent="space-between"
      pl={1}
      py="1px"
      _hover={{ bg: "app.panelBackgroundHover" }}
      transition="background 0.15s"
      {...focusRing}
    >
      <Flex alignItems="center" gap={1} minW={0}>
        {isScheduled && (
          <Text as="span" aria-hidden="true" color="app.textMuted" flexShrink={0} lineHeight={0}>
            <Repeat size={9} />
          </Text>
        )}
        <Text color="app.text" fontSize="xs" overflow="hidden" textOverflow="ellipsis" whiteSpace="nowrap">
          {transaction.description}
        </Text>
      </Flex>
      <TransactionAmount amount={transaction.amount} currency={currency} size="xs" />
    </RouterLink>
  )
}
