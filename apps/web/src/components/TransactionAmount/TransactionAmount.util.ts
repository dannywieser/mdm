/**
 * Formats a signed amount as currency. The sign is carried by the colour of
 * the text in most places, so it is dropped unless `showSign` asks for it —
 * a day cell reads better as "$42.50" than "-$42.50" when it is already red.
 */
export const formatAmount = (amount: number, currency: string, showSign: boolean): string => {
  const formatted = new Intl.NumberFormat("en-US", {
    currency,
    currencyDisplay: "narrowSymbol",
    style: "currency",
  }).format(Math.abs(amount))

  if (!showSign) return formatted
  return amount < 0 ? `-${formatted}` : `+${formatted}`
}

/** Money out is negative; anything else reads as money in. */
export const resolveAmountColor = (amount: number): string =>
  amount < 0 ? "app.negativeText" : "app.positiveText"
