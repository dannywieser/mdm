import { type BreadcrumbSegment } from "./HeaderBreadcrumb.types"

export function resolveCurrentPageLabel(segments: BreadcrumbSegment[]): string | undefined {
  return segments.find(s => s.match && s.label !== undefined)?.label
}
