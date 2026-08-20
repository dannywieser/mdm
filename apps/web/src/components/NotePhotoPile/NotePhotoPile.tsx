import { Box } from "@chakra-ui/react"

import { getImageSrc, getNoteImagePaths } from "../NoteCoverGrid/NoteCoverGrid.util"

import { FadeImage } from "../FadeImage"
import { NoteLink } from "../NoteLink"

import type { NotePhotoPileProps, PhotoPrintProps } from "./NotePhotoPile.types"
import {
  buildPhotoTransform,
  getPhotoPlacement,
  getPileMaxWidthPx,
  PHOTO_SIZE_PX,
  PILE_HEIGHT_PX,
  PILE_PADDING_PX,
} from "./NotePhotoPile.util"

/** Prints keep their paper-white border in every palette. */
const PRINT_WHITE = "#ffffff"

/** Lifting a print straightens it and pulls it clear of the ones above it. */
const LIFTED_STYLE = {
  boxShadow: "0 10px 22px rgba(0, 0, 0, 0.45)",
  transform: "translate(0, -6px) rotate(0deg) scale(1.12)",
  zIndex: 100,
}

const PhotoPrint = ({ count, index, note }: PhotoPrintProps) => {
  const placement = getPhotoPlacement({ count, index, noteId: note.id })
  const images = getNoteImagePaths(note)

  return (
    <NoteLink
      note={note}
      background={PRINT_WHITE}
      borderColor={PRINT_WHITE}
      borderRadius="0"
      borderWidth="4px"
      boxShadow="0 3px 8px rgba(0, 0, 0, 0.4)"
      display="block"
      height={`${String(PHOTO_SIZE_PX)}px`}
      left={placement.left}
      outline="none"
      overflow="hidden"
      position="absolute"
      title={note.title}
      top={`${String(PILE_PADDING_PX)}px`}
      transform={buildPhotoTransform(placement)}
      transition="transform 0.18s ease, box-shadow 0.18s ease"
      width={`${String(PHOTO_SIZE_PX)}px`}
      zIndex={placement.zIndex}
      _hover={LIFTED_STYLE}
      _focusVisible={LIFTED_STYLE}
    >
      <FadeImage
        alt={note.title}
        height="100%"
        objectFit="cover"
        src={getImageSrc(images[0] ?? "")}
        width="100%"
      />
    </NoteLink>
  )
}

/**
 * Renders note covers as a pile of scattered, overlapping photo prints, each
 * with square corners and a white border.
 */
export const NotePhotoPile = ({ notes }: NotePhotoPileProps) => (
  <Box
    data-testid="photo-pile"
    height={`${String(PILE_HEIGHT_PX)}px`}
    maxWidth={`${String(getPileMaxWidthPx(notes.length))}px`}
    position="relative"
  >
    {notes.map((note, index) => (
      <PhotoPrint key={note.id} count={notes.length} index={index} note={note} />
    ))}
  </Box>
)
