import { hashString } from "mdm-util"

import type { PhotoPlacement, PhotoPlacementInput } from "./NotePhotoPile.types"

/** Width and height of a single print, in pixels. */
export const PHOTO_SIZE_PX = 108

/** Largest jitter applied to a print on either axis, in pixels. */
export const PILE_PADDING_PX = 14

/** Widest tilt applied to a print, in degrees. */
const MAX_ROTATION_DEG = 9

/** Horizontal distance between prints when the pile has room to spread out. */
const PHOTO_STEP_PX = 76

/** Height of the pile: one print plus the jitter above and below it. */
export const PILE_HEIGHT_PX = PHOTO_SIZE_PX + PILE_PADDING_PX * 2

/**
 * Derives a stable value in `-max..max` from a hash, using a different slice
 * of its bits per call so one hash yields several uncorrelated offsets.
 */
function jitterFromHash(hash: number, bitShift: number, max: number): number {
  return ((hash >>> bitShift) % (max * 2 + 1)) - max
}

/**
 * Widest the pile is allowed to get: enough room for every print to sit
 * `PHOTO_STEP_PX` from the one before it. Capping the container this way keeps
 * the prints overlapping on a wide screen, while a narrower container
 * compresses them into a tighter pile instead of overflowing.
 */
export function getPileMaxWidthPx(count: number): number {
  return PHOTO_SIZE_PX + Math.max(count - 1, 0) * PHOTO_STEP_PX
}

/**
 * Places one print in the pile: spread across the pile's width, then tilted and
 * nudged by a deterministic amount derived from the note ID, so a pile looks
 * scattered but never reshuffles between renders.
 */
export function getPhotoPlacement({
  count,
  index,
  noteId,
}: PhotoPlacementInput): PhotoPlacement {
  const hash = hashString(noteId)
  const spread = count > 1 ? index / (count - 1) : 0

  return {
    left: `calc((100% - ${String(PHOTO_SIZE_PX)}px) * ${spread.toFixed(4)})`,
    offsetX: jitterFromHash(hash, 3, PILE_PADDING_PX),
    offsetY: jitterFromHash(hash, 11, PILE_PADDING_PX),
    rotation: jitterFromHash(hash, 19, MAX_ROTATION_DEG),
    zIndex: index + 1,
  }
}

/** Builds the CSS `transform` that tilts and nudges a print into place. */
export function buildPhotoTransform({
  offsetX,
  offsetY,
  rotation,
}: PhotoPlacement): string {
  return `translate(${String(offsetX)}px, ${String(offsetY)}px) rotate(${String(rotation)}deg)`
}
