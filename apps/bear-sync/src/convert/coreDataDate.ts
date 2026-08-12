/** Seconds between the Unix epoch (1970-01-01) and Core Data's reference date (2001-01-01). */
const CORE_DATA_EPOCH_OFFSET_SECONDS = 978307200

/** Converts a Core Data reference-date timestamp (as stored in Bear's sqlite columns) to an ISO string. */
export const coreDataTimestampToISOString = (coreDataSeconds: number): string =>
  new Date((coreDataSeconds + CORE_DATA_EPOCH_OFFSET_SECONDS) * 1000).toISOString()
