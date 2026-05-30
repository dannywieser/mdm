import { Alert, VStack } from "@chakra-ui/react"

import { useNotesQuery } from "../../hooks/useNotesQuery"
import { useI18n } from "../../i18n"

import { LoadingScreen } from "../LoadingScreen"
import { NotesCard } from "../"

export const NotesList = () => {
  const { data, error, isLoading } = useNotesQuery()
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
    <VStack align="stretch" gap="2" p="2">
      {data?.notes.map((note) => (
        <NotesCard key={note.id} note={note} />
      ))}
    </VStack>
  )
}
