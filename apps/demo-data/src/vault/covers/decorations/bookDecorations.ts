import type { CoverDecoration } from "../coverSvg.types"

import { randomInt } from "../../random/random"

const spine: CoverDecoration = ({ accent, height }) =>
  `<rect x="0" y="0" width="26" height="${height}" fill="${accent}" opacity="0.65"/>`

const bands: CoverDecoration = ({ accent, height, width }) => {
  const bandY = Math.round(height * 0.55)
  return (
    `<rect x="0" y="${bandY}" width="${width}" height="40" fill="${accent}" opacity="0.5"/>` +
    `<rect x="0" y="${bandY + 52}" width="${width}" height="14" fill="${accent}" opacity="0.35"/>` +
    `<rect x="0" y="${bandY + 78}" width="${width}" height="6" fill="${accent}" opacity="0.25"/>`
  )
}

const diagonalRibbon: CoverDecoration = ({ accent, height, width }) =>
  `<rect x="${-width}" y="${Math.round(height * 0.6)}" width="${width * 3}" height="56" fill="${accent}" opacity="0.4" transform="rotate(-14 ${width / 2} ${height * 0.6})"/>`

const rings: CoverDecoration = ({ accent, height, random, width }) => {
  const centerY = Math.round(height * 0.66)
  const baseRadius = randomInt(random, 60, 90)
  return (
    `<circle cx="${width / 2}" cy="${centerY}" r="${baseRadius + 44}" fill="none" stroke="${accent}" stroke-width="4" opacity="0.3"/>` +
    `<circle cx="${width / 2}" cy="${centerY}" r="${baseRadius + 22}" fill="none" stroke="${accent}" stroke-width="4" opacity="0.45"/>` +
    `<circle cx="${width / 2}" cy="${centerY}" r="${baseRadius}" fill="${accent}" opacity="0.35"/>`
  )
}

const frame: CoverDecoration = ({ accent, height, width }) =>
  `<rect x="18" y="18" width="${width - 36}" height="${height - 36}" fill="none" stroke="${accent}" stroke-width="3" opacity="0.55"/>` +
  `<rect x="30" y="30" width="${width - 60}" height="${height - 60}" fill="none" stroke="${accent}" stroke-width="1.5" opacity="0.4"/>` +
  `<rect x="${width / 2 - 9}" y="${Math.round(height * 0.68)}" width="18" height="18" fill="${accent}" opacity="0.6" transform="rotate(45 ${width / 2} ${Math.round(height * 0.68) + 9})"/>`

export const BOOK_DECORATIONS: readonly CoverDecoration[] = [
  spine,
  bands,
  diagonalRibbon,
  rings,
  frame,
]
