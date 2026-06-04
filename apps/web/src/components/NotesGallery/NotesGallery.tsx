import { Box, Card, Image, SimpleGrid, Text } from "@chakra-ui/react"
import { useParams } from "react-router-dom"

import { useNotesQuery } from "../../hooks/useNotesQuery/useNotesQuery"

import { AppError } from "../AppError/AppError"
import { LoadingScreen } from "../LoadingScreen/LoadingScreen"
import { NoteBadges } from "../NoteBadges/NoteBadges"

import type { NotesGalleryProps, NotesGalleryRouteParamKey } from "./NotesGallery.types"
import { filterNotesWithCovers, getCoverSrc } from "./NotesGallery.util"

export const NotesGallery = ({ badges = [] }: NotesGalleryProps) => {
  const { view } = useParams<NotesGalleryRouteParamKey>()
  const { data, error, isLoading } = useNotesQuery({ view })

  if (isLoading) return <LoadingScreen />
  if (error) return <AppError message={error.message} />

  const notesWithCovers = filterNotesWithCovers(data?.notes ?? [])

  return (
    <SimpleGrid columns={{ base: 1, md: 3, lg: 4 }} gap={4} p={6}>
      {notesWithCovers.map((note) => (
        <Box
          key={note.id}
          className="group"
          borderRadius="md"
          _focusWithin={{ outlineWidth: "2px", outlineStyle: "solid", outlineColor: "app.accent", outlineOffset: "2px" }}
        >
        <a href={note.obsidianUrl} style={{ textDecoration: "none", outline: "none" }}>
          <Card.Root
            bg="app.panelBackground"
            borderColor="app.border"
            overflow="hidden"
            position="relative"
            _hover={{ borderColor: "app.borderHover" }}
          >
            <Image
              alt={note.title}
              aspectRatio="16 / 9"
              objectFit="cover"
              src={getCoverSrc(note.frontmatter!.cover)}
            />
            <Box
              background="rgba(0,0,0,0.65)"
              bottom={0}
              left={0}
              opacity={0}
              p={3}
              position="absolute"
              right={0}
              transition="opacity 0.2s"
              _groupHover={{ opacity: 1 }}
              _groupFocusWithin={{ opacity: 1 }}
            >
              <Text color="white" fontSize="sm" fontWeight="medium" lineClamp={2} mb={badges.length ? 2 : 0}>
                {note.title}
              </Text>
              <NoteBadges badges={badges} note={note} />
            </Box>
          </Card.Root>
        </a>
        </Box>
      ))}
    </SimpleGrid>
  )
}
