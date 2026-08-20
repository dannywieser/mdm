import { Box, HStack, Text } from "@chakra-ui/react"
import { useMemo } from "react"
import { Link } from "react-router-dom"

import { useNotesQuery } from "services"

import { NotePhotoPile } from "../NotePhotoPile"

import type { HomeViewPreviewCardProps } from "./HomeViewPreviewCard.types"
import { selectPreviewNotes } from "./HomeViewPreviewCard.util"

export function HomeViewPreviewCard({ view }: Readonly<HomeViewPreviewCardProps>) {
  const { data } = useNotesQuery({ includeContent: false, view: view.id })
  const previewNotes = useMemo(() => selectPreviewNotes(data.notes), [data.notes])

  if (previewNotes.length === 0) {
    return null
  }

  return (
    <Box
      backgroundColor="app.panelBackground"
      borderColor="app.border"
      borderRadius="md"
      borderWidth="1px"
      px={4}
      py={3}
      _hover={{ borderColor: "app.borderHover" }}
      _focusWithin={{
        outlineWidth: "2px",
        outlineStyle: "solid",
        outlineColor: "app.accent",
        outlineOffset: "2px",
      }}
    >
      <Link
        style={{ textDecoration: "none", outline: "none" }}
        to={`/notes/${view.id}`}
      >
        <HStack justify="space-between" pb={3}>
          <Text color="app.text" fontSize="sm" fontWeight="medium">
            {view.name}
          </Text>
          <Text color="app.textMuted" fontSize="sm">
            {view.count}
          </Text>
        </HStack>
      </Link>
      <NotePhotoPile notes={previewNotes} />
    </Box>
  )
}
