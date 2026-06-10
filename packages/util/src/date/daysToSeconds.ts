const SECONDS_PER_DAY = 86400

/**
 * Converts a number of days to the equivalent number of seconds.
 *
 * @param days Number of days to convert.
 * @returns The equivalent duration in seconds.
 */
export const daysToSeconds = (days: number): number => days * SECONDS_PER_DAY
