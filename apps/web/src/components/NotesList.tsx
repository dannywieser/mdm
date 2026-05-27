import {
  Alert,
  Box,
  Heading,
  SimpleGrid,
  Spinner,
  Text,
  VStack
} from '@chakra-ui/react'

import { useNotesQuery } from '../hooks/useNotesQuery'

import { NotesCard } from './NotesCard'

export const NotesList = () => {
  const { data, error, isLoading } = useNotesQuery()

  if (isLoading) {
    return (
      <Box display="flex" justifyContent="center" py="12">
        <Spinner size="xl" />
      </Box>
    )
  }

  if (error) {
    return (
      <Alert.Root status="error">
        <Alert.Indicator />
        <Alert.Content>
          <Alert.Title>Unable to load notes.</Alert.Title>
          <Alert.Description>{error.message}</Alert.Description>
        </Alert.Content>
      </Alert.Root>
    )
  }

  return (
    <VStack align="stretch" gap="6" p="6">
      <Heading size="lg">Notes</Heading>
      <Text color="fg.muted">
        Vault: {data?.obsidianVault} · Directory: {data?.notesDirectory}
      </Text>
      <SimpleGrid columns={{ base: 1, md: 2 }} gap="4">
        {data?.notes.map((note) => (
          <NotesCard key={note.id} note={note} />
        ))}
      </SimpleGrid>
    </VStack>
  )
}
