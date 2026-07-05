import { Alert, Box, VStack } from "@chakra-ui/react"
import { useParams } from "react-router-dom"

import { useNoteSourceQuery } from "services"
import { useI18n } from "../../i18n"

import type { NoteSourceRouteParamKey } from "./NoteSource.types"

/**
 * Demo-mode replacement for the Obsidian deep link: renders a note's raw
 * markdown source in the browser, since the demo has no vault to open.
 */
export const NoteSource = () => {
  const { t } = useI18n()
  const { noteId = "" } = useParams<NoteSourceRouteParamKey>()
  const { data } = useNoteSourceQuery({ noteId })

  return (
    <VStack align="stretch" gap="4" maxW="4xl" mx="auto" p="6">
      <Alert.Root status="info">
        <Alert.Indicator />
        <Alert.Content>
          <Alert.Description>{t("source.demoNotice")}</Alert.Description>
        </Alert.Content>
      </Alert.Root>
      <Box
        as="pre"
        bg="app.panelBackground"
        borderColor="app.border"
        borderRadius="md"
        borderWidth="1px"
        fontSize="sm"
        overflowX="auto"
        p="4"
        whiteSpace="pre-wrap"
      >
        {data}
      </Box>
    </VStack>
  )
}
