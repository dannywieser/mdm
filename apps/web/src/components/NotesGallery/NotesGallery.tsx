import { useParams } from "react-router-dom"

import { useNotesQuery } from "services"

import { AppError } from "../AppError/AppError"
import { LoadingScreen } from "../LoadingScreen/LoadingScreen"
import { NoteCoverGrid } from "../NoteCoverGrid/NoteCoverGrid"
import { filterNotesWithCovers } from "../NoteCoverGrid/NoteCoverGrid.util"

import type { NotesGalleryProps, NotesGalleryRouteParamKey } from "./NotesGallery.types"

export const NotesGallery = ({ aspectRatio, badges = [] }: NotesGalleryProps) => {
  const { view } = useParams<NotesGalleryRouteParamKey>()
  const { data, error, isLoading } = useNotesQuery({ includeContent: false, view })

  if (isLoading) return <LoadingScreen />
  if (error) return <AppError message={error.message} />

  const notesWithCovers = filterNotesWithCovers(data?.notes ?? [])

  return <NoteCoverGrid aspectRatio={aspectRatio} badges={badges} notes={notesWithCovers} />
}
