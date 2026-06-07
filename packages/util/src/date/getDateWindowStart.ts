import { addDays } from "./addDays"

/**
 * Returns the "YYYY-MM-DD" date that begins a rolling window of `windowDays`
 * days ending on `referenceDate`.
 *
 * @param referenceDate Date string in "YYYY-MM-DD" format marking the end of the window.
 * @param windowDays Size of the window, in days.
 * @returns The "YYYY-MM-DD" date `windowDays` days before `referenceDate`.
 */
export const getDateWindowStart = (referenceDate: string, windowDays: number): string =>
  addDays(referenceDate, -windowDays)
