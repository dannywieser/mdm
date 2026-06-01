import { Alert, VStack } from "@chakra-ui/react"
import { useParams } from "react-router-dom"

import { useNotesQuery } from "../../hooks/useNotesQuery/useNotesQuery"
import { useI18n } from "../../i18n"

import { LoadingScreen } from "../LoadingScreen/LoadingScreen"
import { NotesCard } from "../NotesCard/NotesCard"

import type { NotesRouteParams } from "./NotesList.types"

export const NotesList = () => {
  const { view } = useParams<NotesRouteParams>()
  const { data, error, isLoading } = useNotesQuery(view)
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
          <NotesCard key={note.id} note={note} />
        ))}
      </VStack>
    </VStack>
  )
}
