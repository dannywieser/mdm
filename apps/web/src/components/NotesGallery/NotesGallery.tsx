import { Box, Card, Image, SimpleGrid, Text } from "@chakra-ui/react"
import { useParams } from "react-router-dom"

import { useNotesQuery } from "../../hooks/useNotesQuery/useNotesQuery"

import { AppError } from "../AppError/AppError"
import { LoadingScreen } from "../LoadingScreen/LoadingScreen"
import { NoteBadges } from "../NoteBadges/NoteBadges"

import type {
  GalleryCardProps,
  NotesGalleryLayout,
  NotesGalleryProps,
  NotesGalleryRouteParamKey,
} from "./NotesGallery.types"
import { filterNotesWithCovers, getCoverSrc, resolveLayout } from "./NotesGallery.util"

const CARD_FOCUS_STYLE = {
  outlineWidth: "2px",
  outlineStyle: "solid",
  outlineColor: "app.accent",
  outlineOffset: "2px",
}

const GalleryCard = ({ note, aspectRatio, badges }: GalleryCardProps) => (
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
        aspectRatio={aspectRatio}
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
        <Text
          color="white"
          fontSize="sm"
          fontWeight="medium"
          lineClamp={2}
          mb={badges.length ? 2 : 0}
        >
          {note.title}
        </Text>
        <NoteBadges badges={badges} note={note} />
      </Box>
    </Card.Root>
  </a>
)

const COLUMN_COUNT: Record<NotesGalleryLayout, { base: number; md: number; lg: number }> = {
  flex: { base: 1, md: 3, lg: 4 },
  grid: { base: 1, md: 3, lg: 4 },
}

export const NotesGallery = ({ aspectRatio, badges = [], layout }: NotesGalleryProps) => {
  const { view } = useParams<NotesGalleryRouteParamKey>()
  const { data, error, isLoading } = useNotesQuery({ view })

  if (isLoading) return <LoadingScreen />
  if (error) return <AppError message={error.message} />

  const notesWithCovers = filterNotesWithCovers(data?.notes ?? [])
  const activeLayout = resolveLayout(layout)

  if (activeLayout === "grid") {
    return (
      <SimpleGrid
        columns={COLUMN_COUNT.grid}
        data-testid="gallery-grid"
        gap={4}
        p={6}
      >
        {notesWithCovers.map((note) => (
          <Box
            key={note.id}
            alignSelf="start"
            borderRadius="md"
            className="group"
            _focusWithin={CARD_FOCUS_STYLE}
          >
            <GalleryCard aspectRatio={aspectRatio} badges={badges} note={note} />
          </Box>
        ))}
      </SimpleGrid>
    )
  }

  return (
    <Box
      columnCount={COLUMN_COUNT.flex}
      columnGap={4}
      data-testid="gallery-flex"
      p={6}
    >
      {notesWithCovers.map((note) => (
        <Box
          key={note.id}
          borderRadius="md"
          breakInside="avoid"
          className="group"
          mb={4}
          _focusWithin={CARD_FOCUS_STYLE}
        >
          <GalleryCard aspectRatio={aspectRatio} badges={badges} note={note} />
        </Box>
      ))}
    </Box>
  )
}
