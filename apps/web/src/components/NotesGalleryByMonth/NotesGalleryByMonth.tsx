import { useState } from "react"
import { Box, Heading, NativeSelect } from "@chakra-ui/react"
import { useParams } from "react-router-dom"

import { useNotesQuery } from "services"
import { useI18n } from "../../i18n"

import { AppError } from "../AppError/AppError"
import { LoadingScreen } from "../LoadingScreen/LoadingScreen"
import { NoteCoverGrid } from "../NoteCoverGrid/NoteCoverGrid"
import { filterNotesWithCovers } from "../NoteCoverGrid/NoteCoverGrid.util"

import type { NotesGalleryByMonthProps, NotesGalleryByMonthRouteParamKey } from "./NotesGalleryByMonth.types"
import { getMonthName, getMostRecentYear, groupNotesByMonth } from "./NotesGalleryByMonth.util"

export const NotesGalleryByMonth = ({ aspectRatio, badges = [], year }: NotesGalleryByMonthProps) => {
  const { t } = useI18n()
  const { view } = useParams<NotesGalleryByMonthRouteParamKey>()
  const { data, error, isLoading } = useNotesQuery({ includeContent: false, view })
  const [selectedMonth, setSelectedMonth] = useState<"all" | number>("all")

  if (isLoading) return <LoadingScreen />
  if (error) return <AppError message={error.message} />

  const notesWithCovers = filterNotesWithCovers(data?.notes ?? [])
  const targetYear = year ?? getMostRecentYear(notesWithCovers)
  const notesByMonth = groupNotesByMonth(notesWithCovers, targetYear)
  const months = [...notesByMonth.keys()]
  const visibleMonths = selectedMonth === "all" ? months : months.filter((month) => month === selectedMonth)

  return (
    <Box>
      <Box display="flex" justifyContent="flex-end" px={6} pt={6}>
        <NativeSelect.Root width="auto">
          <NativeSelect.Field
            data-testid="month-filter"
            value={selectedMonth}
            onChange={(event) => {
              const { value } = event.target
              setSelectedMonth(value === "all" ? "all" : Number(value))
            }}
          >
            <option value="all">{t("gallery.allMonths")}</option>
            {months.map((month) => (
              <option key={month} value={month}>
                {getMonthName(month)}
              </option>
            ))}
          </NativeSelect.Field>
          <NativeSelect.Indicator />
        </NativeSelect.Root>
      </Box>
      {visibleMonths.map((month) => (
        <Box key={month}>
          <Heading px={6} pt={6} size="md">
            {getMonthName(month)} {targetYear}
          </Heading>
          <NoteCoverGrid aspectRatio={aspectRatio} badges={badges} notes={notesByMonth.get(month) ?? []} />
        </Box>
      ))}
    </Box>
  )
}
