import type { RecurrenceRule } from "./recurrence.types"

export interface ExpandRecurrenceParams {
  /** Date of the first occurrence; nothing is projected before it. */
  anchorDate: string
  /** Inclusive start of the requested window, "YYYY-MM-DD". */
  from: string
  rule: RecurrenceRule
  /** Inclusive end of the requested window, "YYYY-MM-DD". */
  to: string
  /** Inclusive last date the rule may occur on; unset means it never ends. */
  until?: string
}
