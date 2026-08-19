import type { ViewSummary } from "services"
import { describe, expect, test } from "vitest"

import {
  isPreviewView,
  partitionPreviewViews,
} from "../HomeViewGroupSection.util"

const buildView = (overrides: Partial<ViewSummary>): ViewSummary => ({
  component: "NotesList",
  count: 1,
  id: "view",
  name: "view",
  noteIds: ["a"],
  ...overrides,
})

describe("isPreviewView", () => {
  test("is true for a gallery view with dashboardPreview enabled", () => {
    expect(
      isPreviewView(
        buildView({ component: "NotesGallery", dashboardPreview: true }),
      ),
    ).toBe(true)
  })

  test("is false for a gallery view without dashboardPreview", () => {
    expect(isPreviewView(buildView({ component: "NotesGallery" }))).toBe(false)
  })

  test("is false for a non-gallery view with dashboardPreview enabled", () => {
    expect(
      isPreviewView(
        buildView({ component: "NotesList", dashboardPreview: true }),
      ),
    ).toBe(false)
  })
})

describe("partitionPreviewViews", () => {
  test("splits preview views from standard views, preserving order", () => {
    const preview = buildView({
      component: "NotesGallery",
      dashboardPreview: true,
      id: "preview",
    })
    const list = buildView({ id: "list" })
    const gallery = buildView({ component: "NotesGallery", id: "gallery" })

    expect(partitionPreviewViews([list, preview, gallery])).toEqual({
      previewViews: [preview],
      standardViews: [list, gallery],
    })
  })
})
