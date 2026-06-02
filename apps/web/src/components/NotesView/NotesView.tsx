import type { ComponentType } from "react"
import { useParams } from "react-router-dom"

import { useStatsQuery } from "../../hooks/useStatsQuery/useStatsQuery"

import { LoadingScreen } from "../LoadingScreen/LoadingScreen"
import { NotesList } from "../NotesList/NotesList"
import { NotesReview } from "../NotesReview/NotesReview"

import type {
  NotesViewRouteParamKey,
  ViewComponentName,
} from "./NotesView.types"

const VIEW_COMPONENTS: Record<ViewComponentName, ComponentType> = {
  NotesList,
  NotesReview,
}

export const NotesView = () => {
  const { view } = useParams<NotesViewRouteParamKey>()
  const { data, isLoading } = useStatsQuery({})

  if (isLoading) {
    return <LoadingScreen />
  }

  const configuredView = data?.views.find(({ id }) => id === view)
  const componentName = configuredView?.component as
    | ViewComponentName
    | undefined
  const SelectedComponent =
    (componentName && VIEW_COMPONENTS[componentName]) ?? NotesList

  return <SelectedComponent />
}
