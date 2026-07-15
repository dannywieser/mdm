import type { FrontmatterFacet } from "../NotesGallery/NotesGallery.types"

export interface NotesFilterPanelProps {
  frontmatterFacets: FrontmatterFacet[]
  isOpen: boolean
  onClose: () => void
  yearOptions: number[]
}
