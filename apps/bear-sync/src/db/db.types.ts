export interface BearNoteMetadataRow {
  ZMODIFICATIONDATE: number
  ZUNIQUEIDENTIFIER: string
}

export interface BearNoteRow {
  ZCREATIONDATE: number
  ZMODIFICATIONDATE: number
  ZTEXT: string
  ZTITLE: string
  ZUNIQUEIDENTIFIER: string
}

/** Narrow surface of better-sqlite3's Database this app relies on. */
export interface BearDatabase {
  close: () => void
  prepare: (sql: string) => {
    all: (...params: unknown[]) => unknown[]
  }
}
