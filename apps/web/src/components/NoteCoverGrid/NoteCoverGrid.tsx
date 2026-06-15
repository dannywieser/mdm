import { Box, Card, Text } from "@chakra-ui/react"

import { useMasonryRowSpan } from "../../hooks/useMasonryRowSpan/useMasonryRowSpan"

import { FadeImage } from "../FadeImage"
import { NoteBadges } from "../NoteBadges"

import type { GalleryCardProps, NoteCoverGridProps } from "./NoteCoverGrid.types"
import { getCoverSrc } from "./NoteCoverGrid.util"

const CARD_FOCUS_STYLE = {
  outlineWidth: "2px",
  outlineStyle: "solid",
  outlineColor: "app.accent",
  outlineOffset: "2px",
}

const MASONRY_GAP_PX = 16
const MASONRY_ROW_HEIGHT_PX = 8
const MASONRY_COLUMNS = { base: 1, md: 3, lg: 4, xl: 5, "2xl": 8 }
const DEFAULT_ASPECT_RATIO = "3/4"

const GalleryCard = ({ note, aspectRatio, badges }: GalleryCardProps) => (
  <a href={note.obsidianUrl} style={{ textDecoration: "none", outline: "none" }}>
    <Card.Root
      bg="app.panelBackground"
      borderColor="app.border"
      overflow="hidden"
      position="relative"
      _hover={{ borderColor: "app.borderHover" }}
    >
      <FadeImage
        alt={note.title}
        aspectRatio={aspectRatio ?? DEFAULT_ASPECT_RATIO}
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

const MasonryGalleryCard = ({ aspectRatio, badges, note }: GalleryCardProps) => {
  const { ref, rowSpan } = useMasonryRowSpan({ gapPx: MASONRY_GAP_PX, rowHeightPx: MASONRY_ROW_HEIGHT_PX })

  return (
    <Box
      ref={ref}
      alignSelf="start"
      borderRadius="md"
      className="group"
      style={{ gridRowEnd: `span ${rowSpan}` }}
      _focusWithin={CARD_FOCUS_STYLE}
    >
      <GalleryCard aspectRatio={aspectRatio} badges={badges} note={note} />
    </Box>
  )
}

export const NoteCoverGrid = ({ aspectRatio, badges = [], notes }: NoteCoverGridProps) => (
  <Box
    data-testid="gallery-grid"
    display="grid"
    gap={`${MASONRY_GAP_PX}px`}
    gridAutoFlow="dense"
    gridAutoRows={`${MASONRY_ROW_HEIGHT_PX}px`}
    gridTemplateColumns={{
      base: `repeat(${MASONRY_COLUMNS.base}, 1fr)`,
      md: `repeat(${MASONRY_COLUMNS.md}, 1fr)`,
      lg: `repeat(${MASONRY_COLUMNS.lg}, 1fr)`,
      xl: `repeat(${MASONRY_COLUMNS.xl}, 1fr)`,
      "2xl": `repeat(${MASONRY_COLUMNS["2xl"]}, 1fr)`,
    }}
    p={6}
  >
    {notes.map((note) => (
      <MasonryGalleryCard key={note.id} aspectRatio={aspectRatio} badges={badges} note={note} />
    ))}
  </Box>
)
