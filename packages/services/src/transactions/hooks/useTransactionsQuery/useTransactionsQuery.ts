import { useSuspenseQuery } from "@tanstack/react-query"

import type { TransactionsResponse } from "../../transactions.types"
import type { UseTransactionsQueryParams } from "./useTransactionsQuery.types"

import { getTransactionsBaseUrl } from "../../../config"
import { isDemoMode } from "../../../demo/demoMode"
import { buildDemoTransactionsUrl } from "../../../demo/demoUrls"
import { filterTransactionsToMonth } from "./useTransactionsQuery.util"

const fetchTransactions = async (month: string): Promise<TransactionsResponse> => {
  // The live service projects recurrences into whatever month is asked for.
  // The demo snapshot is a fixed window of pre-expanded occurrences, so demo
  // mode fetches that once and narrows it to the requested month instead.
  if (isDemoMode()) {
    const response = await fetch(buildDemoTransactionsUrl())
    if (!response.ok) {
      throw new Error("errors.unableToLoadTransactions")
    }
    return filterTransactionsToMonth((await response.json()) as TransactionsResponse, month)
  }

  const url = `${getTransactionsBaseUrl()}/transactions?month=${encodeURIComponent(month)}`
  const response = await fetch(url)

  if (!response.ok) {
    throw new Error("errors.unableToLoadTransactions")
  }

  return (await response.json()) as TransactionsResponse
}

export const useTransactionsQuery = ({ month }: UseTransactionsQueryParams) =>
  useSuspenseQuery({
    queryKey: ["transactions", month],
    queryFn: () => fetchTransactions(month),
  })
