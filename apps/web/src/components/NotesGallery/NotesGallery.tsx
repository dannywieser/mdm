import { useMemo, useState } from "react"
import { Box, IconButton } from "@chakra-ui/react"
import { Filter } from "lucide-react"
import { useParams, useSearchParams } from "react-router-dom"

import { useNotesQuery } from "services"

import { useI18n } from "../../i18n"
import { focusRing } from "../../theme/focusRing"
import { AppError } from "../AppError"
import { NotesActiveFilters } from "../NotesActiveFilters"
import { NoteCoverGrid } from "../NoteCoverGrid"
import { filterNotesWithImages } from "../NoteCoverGrid/NoteCoverGrid.util"
import { NotesFilterPanel } from "../NotesFilterPanel"
import {
  buildFrontmatterParamKey,
  getFrontmatterKeysFromParams,
  parseParamValues,
  YEAR_PARAM_KEY,
} from "../NotesFilterFacetGroup/NotesFilterFacetGroup.util"
import { SEARCH_PARAM_KEY } from "../NotesSearchInput/NotesSearchInput.constants"

import {
  buildFrontmatterFacets,
  buildSearchIndex,
  buildYearFacet,
  filterByFrontmatter,
  filterByYear,
  filterSearchIndex,
} from "./NotesGallery.util"
import type { NotesGalleryProps, NotesGalleryRouteParamKey } from "./NotesGallery.types"

export const NotesGallery = ({ badges = [] }: NotesGalleryProps) => {
  const { t } = useI18n()
  const { view } = useParams<NotesGalleryRouteParamKey>()
  const [searchParams] = useSearchParams()
  const [isFilterPanelOpen, setIsFilterPanelOpen] = useState(false)
  const { data, error } = useNotesQuery({ includeContent: false, view })

  const searchQuery = searchParams.get(SEARCH_PARAM_KEY) ?? ""
  const notesWithImages = useMemo(
    () => filterNotesWithImages(data.notes),
    [data.notes],
  )
  const searchIndex = useMemo(() => buildSearchIndex(notesWithImages), [notesWithImages])
  const yearOptions = useMemo(() => buildYearFacet(notesWithImages), [notesWithImages])
  const frontmatterFacets = useMemo(
    () => buildFrontmatterFacets(notesWithImages),
    [notesWithImages],
  )

  const selectedYears = useMemo(
    () =>
      parseParamValues(searchParams, YEAR_PARAM_KEY)
        .map(Number)
        .filter((year) => !Number.isNaN(year)),
    [searchParams],
  )
  const selectedFrontmatter = useMemo(() => {
    const keys = new Set([
      ...frontmatterFacets.map(({ key }) => key),
      ...getFrontmatterKeysFromParams(searchParams),
    ])

    return Object.fromEntries(
      [...keys].map((key) => [key, parseParamValues(searchParams, buildFrontmatterParamKey(key))]),
    )
  }, [frontmatterFacets, searchParams])

  const filteredNotes = useMemo(() => {
    const bySearch = filterSearchIndex(searchIndex, searchQuery)
    const byYear = filterByYear(bySearch, selectedYears)
    return filterByFrontmatter(byYear, selectedFrontmatter)
  }, [searchIndex, searchQuery, selectedYears, selectedFrontmatter])

  if (error) return <AppError message={error.message} />

  return (
    <Box>
      <Box display="flex" flexWrap="wrap" alignItems="center" gap={2} px={6} pt={6}>
        <IconButton
          aria-label={t("gallery.filters")}
          onClick={() => { setIsFilterPanelOpen(true); }}
          size="sm"
          variant="outline"
          color="app.text"
          borderColor="app.border"
          _hover={{ borderColor: "app.borderHover", bg: "app.panelBackgroundHover" }}
          {...focusRing}
        >
          <Filter size={16} />
        </IconButton>
        <NotesActiveFilters selectedFrontmatter={selectedFrontmatter} selectedYears={selectedYears} />
      </Box>
      <NotesFilterPanel
        frontmatterFacets={frontmatterFacets}
        isOpen={isFilterPanelOpen}
        onClose={() => { setIsFilterPanelOpen(false); }}
        yearOptions={yearOptions}
      />
      <NoteCoverGrid badges={badges} notes={filteredNotes} />
    </Box>
  )
}
