import { Alert, VStack } from "@chakra-ui/react"
import { useParams } from "react-router-dom"

import { useNotesQuery } from "services"
import { useI18n } from "../../i18n"

import { LoadingScreen } from "../LoadingScreen"
import { NotesCard } from "../NotesCard"

import type { NotesListProps, NotesRouteParamKey } from "./NotesList.types"

export const NotesList = ({ badges = [] }: NotesListProps) => {
  const { view } = useParams<NotesRouteParamKey>()
  const { data, error, isLoading } = useNotesQuery({ view })
  const { t } = useI18n()

  if (isLoading) {
    return <LoadingScreen />
  }

  if (error) {
    return (
      <Alert.Root status="error">
        <Alert.Indicator />
        <Alert.Content>
          <Alert.Title>{t("notes.errorTitle")}</Alert.Title>
          <Alert.Description>{error.message}</Alert.Description>
        </Alert.Content>
      </Alert.Root>
    )
  }

  return (
    <VStack align="stretch" gap="6" p="6">
      <VStack align="stretch" gap="4">
        {data?.notes.map((note) => (
          <NotesCard badges={badges} key={note.id} note={note} />
        ))}
      </VStack>
    </VStack>
  )
}
