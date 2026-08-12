import type { BearSyncConfig } from "../../config.types"
import type { BearDatabase } from "../../db/db.types"

import { convertBearNoteToScannedNote } from "../../convert/convertBearNoteToScannedNote"
import { copyDatabaseFile } from "../../db/copyDatabaseFile"
import { openBearDatabase } from "../../db/openBearDatabase"
import { queryLiveNoteMetadata } from "../../db/queryLiveNoteMetadata"
import { queryNotesByIds } from "../../db/queryNotesByIds"
import { diffNoteIds } from "../diffNoteIds"
import { loadSyncState } from "../loadSyncState"
import { pushSyncPayload } from "../pushSyncPayload"
import { runSync } from "../runSync"
import { saveSyncState } from "../saveSyncState"

vi.mock("../../db/copyDatabaseFile", () => ({ copyDatabaseFile: vi.fn() }))
vi.mock("../../db/openBearDatabase", () => ({ openBearDatabase: vi.fn() }))
vi.mock("../../db/queryLiveNoteMetadata", () => ({ queryLiveNoteMetadata: vi.fn() }))
vi.mock("../../db/queryNotesByIds", () => ({ queryNotesByIds: vi.fn() }))
vi.mock("../../convert/convertBearNoteToScannedNote", () => ({
  convertBearNoteToScannedNote: vi.fn(),
}))
vi.mock("../diffNoteIds", () => ({ diffNoteIds: vi.fn() }))
vi.mock("../loadSyncState", () => ({ loadSyncState: vi.fn() }))
vi.mock("../pushSyncPayload", () => ({ pushSyncPayload: vi.fn() }))
vi.mock("../saveSyncState", () => ({ saveSyncState: vi.fn() }))

const copyDatabaseFileMock = vi.mocked(copyDatabaseFile)
const openBearDatabaseMock = vi.mocked(openBearDatabase)
const queryLiveNoteMetadataMock = vi.mocked(queryLiveNoteMetadata)
const queryNotesByIdsMock = vi.mocked(queryNotesByIds)
const convertBearNoteToScannedNoteMock = vi.mocked(convertBearNoteToScannedNote)
const diffNoteIdsMock = vi.mocked(diffNoteIds)
const loadSyncStateMock = vi.mocked(loadSyncState)
const pushSyncPayloadMock = vi.mocked(pushSyncPayload)
const saveSyncStateMock = vi.mocked(saveSyncState)

const config: BearSyncConfig = {
  bearDbPath: "/source/database.sqlite",
  dateFormats: [],
  notesIngestUrl: "https://notes-ingest:3005",
  syncStatePath: "/state.json",
}

describe("runSync", () => {
  test("pushes only changed notes, deletes removed ids, and persists the new state", async () => {
    const close = vi.fn()
    const db: BearDatabase = { close, prepare: vi.fn() }
    const liveNotes = [
      { ZMODIFICATIONDATE: 0, ZUNIQUEIDENTIFIER: "a" },
      { ZMODIFICATIONDATE: 100, ZUNIQUEIDENTIFIER: "b" },
    ]
    const changedRow = {
      ZCREATIONDATE: 0,
      ZMODIFICATIONDATE: 100,
      ZTEXT: "text",
      ZTITLE: "b",
      ZUNIQUEIDENTIFIER: "b",
    }
    const convertedNote = { id: "b", title: "b" }

    copyDatabaseFileMock.mockResolvedValue("/mock-tmp/database.sqlite")
    openBearDatabaseMock.mockReturnValue(db)
    loadSyncStateMock.mockResolvedValue({ a: "2001-01-01T00:00:00.000Z", c: "old" })
    queryLiveNoteMetadataMock.mockReturnValue(liveNotes)
    diffNoteIdsMock.mockReturnValue({ changedIds: ["b"], deletedIds: ["c"] })
    queryNotesByIdsMock.mockReturnValue([changedRow])
    convertBearNoteToScannedNoteMock.mockReturnValue(convertedNote as never)
    pushSyncPayloadMock.mockResolvedValue(undefined)
    saveSyncStateMock.mockResolvedValue(undefined)

    const summary = await runSync(config)

    expect(copyDatabaseFileMock).toHaveBeenCalledWith("/source/database.sqlite")
    expect(openBearDatabaseMock).toHaveBeenCalledWith("/mock-tmp/database.sqlite")
    expect(queryNotesByIdsMock).toHaveBeenCalledWith(db, ["b"])
    expect(convertBearNoteToScannedNoteMock).toHaveBeenCalledWith(changedRow, [])
    expect(pushSyncPayloadMock).toHaveBeenCalledWith("https://notes-ingest:3005", {
      deletedIds: ["c"],
      upserts: [convertedNote],
    })
    expect(saveSyncStateMock).toHaveBeenCalledWith("/state.json", {
      a: "2001-01-01T00:00:00.000Z",
      b: "2001-01-01T00:01:40.000Z",
    })
    expect(close).toHaveBeenCalled()
    expect(summary).toEqual({ deleted: 1, unchanged: 1, upserted: 1 })
  })

  test("closes the database even when the push fails", async () => {
    const close = vi.fn()
    const db: BearDatabase = { close, prepare: vi.fn() }

    copyDatabaseFileMock.mockResolvedValue("/mock-tmp/database.sqlite")
    openBearDatabaseMock.mockReturnValue(db)
    loadSyncStateMock.mockResolvedValue({})
    queryLiveNoteMetadataMock.mockReturnValue([])
    diffNoteIdsMock.mockReturnValue({ changedIds: [], deletedIds: [] })
    queryNotesByIdsMock.mockReturnValue([])
    pushSyncPayloadMock.mockRejectedValue(new Error("network error"))

    await expect(runSync(config)).rejects.toThrow("network error")
    expect(close).toHaveBeenCalled()
    expect(saveSyncStateMock).not.toHaveBeenCalled()
  })
})
