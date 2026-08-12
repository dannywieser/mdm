import type { ScannedNote } from "markdown"

import {
  extractNoteDates,
  extractTags,
  parseFrontMatter,
  resolveFrontmatterImages,
  resolveOldestDate,
} from "markdown"

import type { BearNoteRow } from "../db/db.types"

import { buildBearUrl } from "./buildBearUrl"
import { coreDataTimestampToISOString } from "./coreDataDate"

/**
 * Converts a raw Bear note row into a ScannedNote, the same shape notes-api
 * gets from scanning an Obsidian file. Bear notes have no folder or local
 * attachments concept (out of scope for the text sync pipeline), so those
 * fields are left empty — resolveFrontmatterImages is still called so images
 * referenced by external URL (the only kind Bear notes carry) end up in
 * frontmatter.images; a bare local filename just resolves to itself, since
 * there's no attachments directory to root it in.
 */
export const convertBearNoteToScannedNote = (
  row: BearNoteRow,
  dateFormats: readonly string[],
): ScannedNote => {
  const { body, frontmatter } = parseFrontMatter(row.ZTEXT)
  const modifiedDate = coreDataTimestampToISOString(row.ZMODIFICATIONDATE)
  const creationDate = coreDataTimestampToISOString(row.ZCREATIONDATE)

  const dates = Array.from(
    new Set([
      ...extractNoteDates(row.ZTITLE, row.ZTEXT, dateFormats),
      modifiedDate,
      creationDate,
    ]),
  )

  return {
    basename: row.ZTITLE,
    dates,
    createdDate: resolveOldestDate(dates, dateFormats)?.toISOString() ?? null,
    folder: "",
    frontmatter: resolveFrontmatterImages(frontmatter, body, "", ""),
    fullPath: row.ZUNIQUEIDENTIFIER,
    fullText: body,
    id: row.ZUNIQUEIDENTIFIER,
    modifiedDate,
    obsidianUrl: buildBearUrl(row.ZUNIQUEIDENTIFIER),
    tags: extractTags(body),
    title: row.ZTITLE,
  }
}
