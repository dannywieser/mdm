import type { BearDatabase, BearNoteRow } from "./db.types"

/** Fetches full note content for the given IDs (used for changed notes only). */
export const queryNotesByIds = (db: BearDatabase, ids: string[]): BearNoteRow[] => {
  if (ids.length === 0) return []

  const placeholders = ids.map(() => "?").join(",")

  return db
    .prepare(
      `SELECT ZUNIQUEIDENTIFIER, ZTITLE, ZTEXT, ZCREATIONDATE, ZMODIFICATIONDATE FROM ZSFNOTE WHERE ZUNIQUEIDENTIFIER IN (${placeholders})`,
    )
    .all(...ids) as BearNoteRow[]
}
