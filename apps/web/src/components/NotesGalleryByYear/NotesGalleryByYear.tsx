import { useState } from "react"
import { Box, Heading, NativeSelect } from "@chakra-ui/react"
import { useParams } from "react-router-dom"

import { useNotesQuery } from "services"
import { useI18n } from "../../i18n"

import { AppError } from "../AppError"
import { NoteCoverGrid } from "../NoteCoverGrid"
import { filterNotesWithCovers } from "../NoteCoverGrid/NoteCoverGrid.util"

import type { NotesGalleryByYearProps, NotesGalleryByYearRouteParamKey } from "./NotesGalleryByYear.types"
import { groupNotesByYear } from "./NotesGalleryByYear.util"

export const NotesGalleryByYear = ({ aspectRatio, badges = [], coverProperty }: NotesGalleryByYearProps) => {
  const { t } = useI18n()
  const { view } = useParams<NotesGalleryByYearRouteParamKey>()
  const { data, error } = useNotesQuery({ includeContent: false, view })
  const [selectedYear, setSelectedYear] = useState<"all" | number>("all")

  if (error) return <AppError message={error.message} />

  const notesWithCovers = filterNotesWithCovers(data.notes, coverProperty)
  const notesByYear = groupNotesByYear(notesWithCovers)
  const years = [...notesByYear.keys()]
  const visibleYears = selectedYear === "all" ? years : years.filter((year) => year === selectedYear)

  return (
    <Box>
      <Box display="flex" justifyContent="flex-end" px={6} pt={6}>
        <NativeSelect.Root width="auto">
          <NativeSelect.Field
            data-testid="year-filter"
            value={selectedYear}
            onChange={(event) => {
              const { value } = event.target
              setSelectedYear(value === "all" ? "all" : Number(value))
            }}
          >
            <option value="all">{t("gallery.allYears")}</option>
            {years.map((year) => (
              <option key={year} value={year}>
                {year}
              </option>
            ))}
          </NativeSelect.Field>
          <NativeSelect.Indicator />
        </NativeSelect.Root>
      </Box>
      {visibleYears.map((year) => (
        <Box key={year}>
          <Heading px={6} pt={6} size="md">
            {year}
          </Heading>
          <NoteCoverGrid aspectRatio={aspectRatio} badges={badges} coverProperty={coverProperty} notes={notesByYear.get(year) ?? []} />
        </Box>
      ))}
    </Box>
  )
}
