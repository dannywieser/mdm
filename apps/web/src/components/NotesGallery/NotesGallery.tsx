import { useMemo } from "react"
import { useParams, useSearchParams } from "react-router-dom"

import { useNotesQuery } from "services"

import { AppError } from "../AppError"
import { NoteCoverGrid } from "../NoteCoverGrid"
import { filterNotesWithCovers } from "../NoteCoverGrid/NoteCoverGrid.util"

import { buildSearchIndex, filterSearchIndex } from "./NotesGallery.util"
import type { NotesGalleryProps, NotesGalleryRouteParamKey } from "./NotesGallery.types"
import { SEARCH_PARAM_KEY } from "../NotesSearchInput/NotesSearchInput.constants"

export const NotesGallery = ({ aspectRatio, badges = [] }: NotesGalleryProps) => {
  const { view } = useParams<NotesGalleryRouteParamKey>()
  const [searchParams] = useSearchParams()
  const { data, error } = useNotesQuery({ includeContent: false, view })

  const searchQuery = searchParams.get(SEARCH_PARAM_KEY) ?? ""
  const notesWithCovers = useMemo(
    () => filterNotesWithCovers(data.notes),
    [data.notes],
  )
  const searchIndex = useMemo(() => buildSearchIndex(notesWithCovers), [notesWithCovers])
  const filteredNotes = useMemo(
    () => filterSearchIndex(searchIndex, searchQuery),
    [searchIndex, searchQuery],
  )

  if (error) return <AppError message={error.message} />

  return <NoteCoverGrid aspectRatio={aspectRatio} badges={badges} notes={filteredNotes} />
}
