import { addDays, addMonthsToDate, daysBetween, monthsBetween } from "mdm-util"

import type { ExpandRecurrenceParams } from "./expandRecurrence.types"

/**
 * Ceiling on occurrences returned for a single rule in a single request, so
 * a caller asking for a decade-wide range of a daily rule can't force an
 * unbounded response. The calendar requests one month at a time, which is
 * orders of magnitude below this.
 */
const MAX_OCCURRENCES = 1000

const DAYS_PER_WEEK = 7
const MONTHS_PER_YEAR = 12

/**
 * Occurrences of day- and week-based rules are a fixed number of days apart,
 * so the first one on or after `from` is found arithmetically rather than by
 * stepping forward from the anchor — that is what lets a rule anchored years
 * in the past be projected into an arbitrarily distant month at constant cost.
 */
const expandFixedDayStep = (
  anchorDate: string,
  stepDays: number,
  from: string,
  end: string,
): string[] => {
  const offsetDays = daysBetween(anchorDate, from)
  const firstIndex = offsetDays <= 0 ? 0 : Math.ceil(offsetDays / stepDays)

  const occurrences: string[] = []
  let date = addDays(anchorDate, firstIndex * stepDays)
  while (date <= end && occurrences.length < MAX_OCCURRENCES) {
    occurrences.push(date)
    date = addDays(date, stepDays)
  }
  return occurrences
}

/**
 * Month- and year-based rules can't use plain day arithmetic because months
 * vary in length and a day-of-month past a short month's end is clamped. The
 * month distance still gives a close estimate of the first occurrence index,
 * so this seeks to it directly and then walks the last step or two exactly.
 */
const expandMonthStep = (
  anchorDate: string,
  stepMonths: number,
  from: string,
  end: string,
): string[] => {
  const offsetMonths = monthsBetween(anchorDate, from)
  let index = offsetMonths <= 0 ? 0 : Math.max(0, Math.floor(offsetMonths / stepMonths) - 1)

  while (addMonthsToDate(anchorDate, index * stepMonths) < from) {
    index += 1
  }

  const occurrences: string[] = []
  let date = addMonthsToDate(anchorDate, index * stepMonths)
  while (date <= end && occurrences.length < MAX_OCCURRENCES) {
    occurrences.push(date)
    index += 1
    date = addMonthsToDate(anchorDate, index * stepMonths)
  }
  return occurrences
}

/**
 * Projects every occurrence of a recurring transaction that falls inside the
 * requested window. Occurrences run forward from `anchorDate` forever unless
 * the note caps them with `until`, so a schedule with no end date resolves in
 * any future window the calendar navigates to — nothing is precomputed or
 * capped at a fixed horizon.
 *
 * Occurrences before the anchor are never produced: the anchor is the first
 * occurrence, not merely a phase reference.
 *
 * @param params Anchor date, rule, inclusive window and optional end date.
 * @returns Ascending "YYYY-MM-DD" occurrence dates within the window.
 */
export const expandRecurrence = ({
  anchorDate,
  from,
  rule,
  to,
  until,
}: ExpandRecurrenceParams): string[] => {
  const end = until && until < to ? until : to
  const start = from < anchorDate ? anchorDate : from
  if (start > end) return []

  if (rule.unit === "day" || rule.unit === "week") {
    const stepDays = rule.interval * (rule.unit === "week" ? DAYS_PER_WEEK : 1)
    return expandFixedDayStep(anchorDate, stepDays, start, end)
  }

  const stepMonths = rule.interval * (rule.unit === "year" ? MONTHS_PER_YEAR : 1)
  return expandMonthStep(anchorDate, stepMonths, start, end)
}
