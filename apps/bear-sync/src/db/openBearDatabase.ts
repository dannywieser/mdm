import Database from "better-sqlite3"

import type { BearDatabase } from "./db.types"

/**
 * Opens a read-only connection to a (already-copied) Bear sqlite database
 * file. better-sqlite3's `prepare` is generic/overloaded in a way that
 * doesn't structurally satisfy the narrower BearDatabase surface this app
 * actually uses, so the cast is a deliberate narrowing, not a type escape
 * hatch — the runtime shape is a strict superset of BearDatabase.
 */
export const openBearDatabase = (databasePath: string): BearDatabase =>
  new Database(databasePath, { fileMustExist: true, readonly: true }) as unknown as BearDatabase
