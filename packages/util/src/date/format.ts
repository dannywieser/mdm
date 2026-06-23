import { format as fnsFormat } from "date-fns/format"

export function format(date: Date, formatString: string): string {
  return fnsFormat(date, formatString)
}
