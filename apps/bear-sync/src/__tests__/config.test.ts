import { resolveBearSyncConfig } from "../config"

describe("resolveBearSyncConfig", () => {
  test("throws when NOTES_INGEST_URL is not set", () => {
    expect(() => resolveBearSyncConfig({})).toThrow(
      "NOTES_INGEST_URL environment variable is required",
    )
  })

  test("resolves notesIngestUrl from the env var", () => {
    const config = resolveBearSyncConfig({ NOTES_INGEST_URL: "https://notes-ingest:3005" })

    expect(config.notesIngestUrl).toBe("https://notes-ingest:3005")
  })

  test("defaults bearDbPath and syncStatePath when omitted", () => {
    const config = resolveBearSyncConfig({ NOTES_INGEST_URL: "https://notes-ingest:3005" })

    expect(config.bearDbPath).toContain("shinyfrog.bear")
    expect(config.syncStatePath).toContain(".mdm-bear-sync")
  })

  test("uses configured bearDbPath and syncStatePath when provided", () => {
    const config = resolveBearSyncConfig({
      BEAR_DB_PATH: "/custom/database.sqlite",
      NOTES_INGEST_URL: "https://notes-ingest:3005",
      SYNC_STATE_PATH: "/custom/state.json",
    })

    expect(config.bearDbPath).toBe("/custom/database.sqlite")
    expect(config.syncStatePath).toBe("/custom/state.json")
  })

  test("defaults dateFormats to an empty array when omitted", () => {
    const config = resolveBearSyncConfig({ NOTES_INGEST_URL: "https://notes-ingest:3005" })

    expect(config.dateFormats).toEqual([])
  })

  test("parses a comma-separated dateFormats list", () => {
    const config = resolveBearSyncConfig({
      BEAR_DATE_FORMATS: "YYYY.MM.DD, YY/MM/DD",
      NOTES_INGEST_URL: "https://notes-ingest:3005",
    })

    expect(config.dateFormats).toEqual(["YYYY.MM.DD", "YY/MM/DD"])
  })
})
