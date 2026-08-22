import { getDayOfWeek } from "mdm-util"

import type { TransactionDayDetailAlign } from "./TransactionDayDetail.types"

const LAST_WEEKDAY = 6

/**
 * Picks the edge a day's detail panel hangs from. The panel is wider than a
 * single column, so a centred one would spill off the page on the first and
 * last columns of the grid — those anchor to their own edge instead.
 *
 * @param date "YYYY-MM-DD" date of the cell the panel belongs to.
 * @returns The alignment to position the panel with.
 */
export const resolveDetailAlign = (date: string): TransactionDayDetailAlign => {
  const weekday = getDayOfWeek(date)
  if (weekday === 0) return "start"
  if (weekday === LAST_WEEKDAY) return "end"
  return "center"
}

/** Absolute-positioning props for each alignment. */
export const buildAlignProps = (
  align: TransactionDayDetailAlign,
): { left?: string; right?: string; transform?: string } => {
  if (align === "start") return { left: "0" }
  if (align === "end") return { right: "0" }
  return { left: "50%", transform: "translateX(-50%)" }
}
