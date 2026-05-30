import {
  Alert,
  Heading,
  Text,
  VStack
} from '@chakra-ui/react'

import { useNotesQuery } from '../hooks/useNotesQuery'
import { useI18n } from '../i18n'

import { LoadingScreen } from './LoadingScreen'
import { NotesCard } from './NotesCard'

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
          <Alert.Title>{t('notes.errorTitle')}</Alert.Title>
          <Alert.Description>{error.message}</Alert.Description>
        </Alert.Content>
      </Alert.Root>
    )
  }

  return (
    <VStack align="stretch" gap="6" p="6">
      <Heading size="lg">{t('notes.header')}</Heading>
      <Text color="fg.muted">
        {t('notes.meta', {
          directory: data?.notesDirectory ?? '',
          vault: data?.obsidianVault ?? ''
        })}
      </Text>
      <VStack align="stretch" gap="4">
        {data?.notes.map((note) => (
          <NotesCard key={note.id} note={note} />
        ))}
      </VStack>
    </VStack>
  )
}
