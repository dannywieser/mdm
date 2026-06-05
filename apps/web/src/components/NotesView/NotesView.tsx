import type { ComponentType } from "react"
import { useParams } from "react-router-dom"

import { useStatsQuery } from "../../hooks/useStatsQuery/useStatsQuery"

import { NotesGallery } from "../NotesGallery/NotesGallery"
import { NotesList } from "../NotesList/NotesList"
import { NotesReview } from "../NotesReview/NotesReview"
import { NotesSummaryTable } from "../NotesSummaryTable/NotesSummaryTable"

import type {
  NotesViewRouteParamKey,
  ViewComponentName,
} from "./NotesView.types"

interface ViewComponentProps {
  aspectRatio?: string
  badges?: string[]
}

const VIEW_COMPONENTS: Record<ViewComponentName, ComponentType<ViewComponentProps>> = {
  NotesList,
  NotesGallery,
  NotesReview,
  NotesSummaryTable,
}

export const NotesView = () => {
  const { view } = useParams<NotesViewRouteParamKey>()
  const { data } = useStatsQuery({})

  const configuredView = data.views.find(({ id }) => id === view)
  const componentName = configuredView?.component as ViewComponentName | undefined
  const SelectedComponent =
    (componentName && VIEW_COMPONENTS[componentName]) ?? NotesList

  return <SelectedComponent aspectRatio={configuredView?.aspectRatio} badges={configuredView?.badges} key={view} />
}
