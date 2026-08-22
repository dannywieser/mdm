import type { ScheduledTransactionSeed, LoggedTransactionSeed } from "./transactionsCorpus.types"

/**
 * Recurring commitments. Each becomes one note whose `recurrence` the
 * transaction service projects forward with no end date, so the demo
 * calendar is populated in every month — past and future alike.
 */
export const SCHEDULED_TRANSACTIONS: readonly ScheduledTransactionSeed[] = [
  { amount: 2450, category: "income", dayOfMonth: 15, description: "Paycheque", recurrence: "biweekly" },
  { amount: -1650, category: "housing", dayOfMonth: 1, description: "Rent", recurrence: "monthly" },
  { amount: -78.5, category: "utilities", dayOfMonth: 8, description: "Electric bill", recurrence: "monthly" },
  { amount: -64, category: "utilities", dayOfMonth: 12, description: "Internet", recurrence: "monthly" },
  { amount: -14.99, category: "subscriptions", dayOfMonth: 3, description: "Music streaming", recurrence: "monthly" },
  { amount: -19.99, category: "subscriptions", dayOfMonth: 21, description: "Film streaming", recurrence: "monthly" },
  { amount: -42, category: "health", dayOfMonth: 5, description: "Gym membership", recurrence: "monthly" },
  { amount: -320, category: "insurance", dayOfMonth: 18, description: "Car insurance", recurrence: "quarterly" },
  { amount: -95, category: "home", dayOfMonth: 22, description: "Window cleaning", recurrence: "every 2 months" },
  { amount: -140, category: "subscriptions", dayOfMonth: 9, description: "Domain renewals", recurrence: "yearly" },
]

/** One-off spending, sampled to produce the logged entries in each month. */
export const LOGGED_TRANSACTIONS: readonly LoggedTransactionSeed[] = [
  { amount: -82.4, category: "groceries", description: "Grocery run" },
  { amount: -46.15, category: "groceries", description: "Farmers market" },
  { amount: -12.75, category: "dining", description: "Coffee and pastry" },
  { amount: -58.2, category: "dining", description: "Dinner out" },
  { amount: -34.5, category: "transport", description: "Fuel" },
  { amount: -3.6, category: "transport", description: "Transit fare" },
  { amount: -128, category: "home", description: "Hardware store" },
  { amount: -22.99, category: "books", description: "Paperback" },
  { amount: -61.3, category: "clothing", description: "New running shoes" },
  { amount: -15, category: "gifts", description: "Birthday card and flowers" },
  { amount: -240, category: "travel", description: "Weekend train tickets" },
  { amount: -18.4, category: "dining", description: "Takeaway" },
  { amount: 120, category: "income", description: "Sold old bike" },
  { amount: 65, category: "income", description: "Refund" },
  { amount: -9.99, category: "subscriptions", description: "Ebook rental" },
]
