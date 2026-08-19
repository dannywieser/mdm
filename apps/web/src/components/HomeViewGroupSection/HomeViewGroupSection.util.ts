import type { ViewSummary } from "services"

/** Views rendered as a full-width gallery preview instead of a compact stat card. */
export function isPreviewView(view: ViewSummary): boolean {
  return view.component === "NotesGallery" && view.dashboardPreview === true
}

/** Splits a group's views into full-width preview cards and compact stat cards. */
export function partitionPreviewViews(views: ViewSummary[]): {
  previewViews: ViewSummary[]
  standardViews: ViewSummary[]
} {
  return {
    previewViews: views.filter(isPreviewView),
    standardViews: views.filter((view) => !isPreviewView(view)),
  }
}
