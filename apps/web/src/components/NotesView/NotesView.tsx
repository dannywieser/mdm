import type { ComponentType } from "react"
import { useParams } from "react-router-dom"

import { useViewsQuery } from "services"

import { NotesGallery } from "../NotesGallery"
import { NotesGalleryByMonth } from "../NotesGalleryByMonth"
import { NotesGalleryByYear } from "../NotesGalleryByYear"
import { NotesList } from "../NotesList"
import { NotesReview } from "../NotesReview"
import { NotesSummaryTable } from "../NotesSummaryTable"

import type {
  NotesViewRouteParamKey,
  ViewComponentName,
  ViewComponentProps,
} from "./NotesView.types"

const VIEW_COMPONENTS: Record<ViewComponentName, ComponentType<ViewComponentProps>> = {
  NotesList,
  NotesGallery,
  NotesGalleryByMonth,
  NotesGalleryByYear,
  NotesReview,
  NotesSummaryTable,
}

export const NotesView = () => {
  const { view } = useParams<NotesViewRouteParamKey>()
  const { data } = useViewsQuery({})

  const configuredView = data.views.find(({ id }) => id === view)
  const componentName = configuredView?.component as ViewComponentName | undefined
  const SelectedComponent =
    (componentName && VIEW_COMPONENTS[componentName]) ?? NotesList

  return (
    <SelectedComponent
      aspectRatio={configuredView?.aspectRatio}
      badges={configuredView?.badges}
      coverProperty={data.coverProperty}
      layout={configuredView?.layout}
      key={view}
    />
  )
}
