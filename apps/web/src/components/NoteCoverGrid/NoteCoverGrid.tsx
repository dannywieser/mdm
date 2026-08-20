import { Box, Card, Text } from "@chakra-ui/react"

import { useMasonryRowSpan } from "../../hooks/useMasonryRowSpan/useMasonryRowSpan"

import { FadeImage } from "../FadeImage"
import { NoteBadges } from "../NoteBadges"
import { NoteLink } from "../NoteLink"

import type { GalleryCardProps, NoteCoverGridProps } from "./NoteCoverGrid.types"
import {
  buildGridTemplateColumns,
  getImageSrc,
  getMasonryLayout,
  getNoteImagePaths,
} from "./NoteCoverGrid.util"

const CARD_FOCUS_STYLE = {
  outlineWidth: "2px",
  outlineStyle: "solid",
  outlineColor: "app.accent",
  outlineOffset: "2px",
}

const DEFAULT_ASPECT_RATIO = "3/4"

const GalleryCard = ({ badges, layout, note }: GalleryCardProps) => {
  const images = getNoteImagePaths(note)

  return (
    <NoteLink note={note} display="block" textDecoration="none" outline="none">
      <Card.Root
        bg="app.panelBackground"
        borderColor="app.border"
        overflow="hidden"
        position="relative"
        _hover={{ borderColor: "app.borderHover" }}
      >
        <FadeImage
          alt={note.title}
          aspectRatio={DEFAULT_ASPECT_RATIO}
          objectFit="cover"
          src={getImageSrc(images[0] ?? "")}
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
            fontSize={layout.titleFontSize}
            fontWeight="medium"
            lineClamp={2}
            mb={badges.length ? 2 : 0}
          >
            {note.title}
          </Text>
          <NoteBadges badges={badges} note={note} />
        </Box>
      </Card.Root>
    </NoteLink>
  )
}

const MasonryGalleryCard = ({ badges, layout, note }: GalleryCardProps) => {
  const { ref, rowSpan } = useMasonryRowSpan({
    gapPx: layout.gapPx,
    rowHeightPx: layout.rowHeightPx,
  })

  return (
    <Box
      ref={ref}
      alignSelf="start"
      borderRadius="md"
      className="group"
      style={{ gridRowEnd: `span ${String(rowSpan)}` }}
      _focusWithin={CARD_FOCUS_STYLE}
    >
      <GalleryCard badges={badges} layout={layout} note={note} />
    </Box>
  )
}

export const NoteCoverGrid = ({ badges = [], notes }: NoteCoverGridProps) => {
  const layout = getMasonryLayout()

  return (
    <Box
      data-testid="gallery-grid"
      display="grid"
      gap={`${String(layout.gapPx)}px`}
      gridAutoFlow="dense"
      gridAutoRows={`${String(layout.rowHeightPx)}px`}
      gridTemplateColumns={buildGridTemplateColumns(layout)}
      p={layout.padding}
    >
      {notes.map((note) => (
        <MasonryGalleryCard
          key={note.id}
          badges={badges}
          layout={layout}
          note={note}
        />
      ))}
    </Box>
  )
}
