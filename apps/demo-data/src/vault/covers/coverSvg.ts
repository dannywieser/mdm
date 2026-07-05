import type {
  CoverDecoration,
  CoverDimensions,
  CoverKind,
  CoverSvgOptions,
} from "./coverSvg.types"

import { createRandom, pickOne, randomInt } from "../random/random"
import { BOOK_DECORATIONS } from "./decorations/bookDecorations"
import { MOVIE_DECORATIONS } from "./decorations/movieDecorations"
import { PHOTO_DECORATIONS } from "./decorations/photoDecorations"
import { RECIPE_DECORATIONS } from "./decorations/recipeDecorations"

const PALETTES: readonly (readonly [string, string, string])[] = [
  ["#1d3557", "#457b9d", "#f1faee"],
  ["#264653", "#2a9d8f", "#e9c46a"],
  ["#3a0ca3", "#7209b7", "#f72585"],
  ["#582f0e", "#936639", "#eaddca"],
  ["#14532d", "#4d7c0f", "#ecfccb"],
  ["#7f1d1d", "#b91c1c", "#fee2e2"],
  ["#0c4a6e", "#0284c7", "#e0f2fe"],
  ["#4a044e", "#a21caf", "#fae8ff"],
]

// Books and movies stay portrait like real covers; photos and recipes mix
// square, letterbox, portrait, and panoramic frames so masonry galleries
// show varied cell heights.
const COVER_DIMENSIONS: Record<CoverKind, readonly CoverDimensions[]> = {
  book: [{ height: 600, width: 400 }],
  movie: [{ height: 600, width: 400 }],
  photo: [
    { height: 600, width: 600 },
    { height: 450, width: 800 },
    { height: 750, width: 600 },
    { height: 400, width: 900 },
    { height: 600, width: 800 },
  ],
  recipe: [
    { height: 600, width: 600 },
    { height: 500, width: 800 },
    { height: 700, width: 560 },
  ],
}

const DECORATIONS: Record<CoverKind, readonly CoverDecoration[]> = {
  book: BOOK_DECORATIONS,
  movie: MOVIE_DECORATIONS,
  photo: PHOTO_DECORATIONS,
  recipe: RECIPE_DECORATIONS,
}

const escapeXml = (value: string): string =>
  value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")

const wrapTitle = (title: string, maxCharsPerLine: number): string[] => {
  const lines: string[] = []
  let current = ""
  for (const word of title.split(/\s+/)) {
    const candidate = current ? `${current} ${word}` : word
    if (candidate.length > maxCharsPerLine && current) {
      lines.push(current)
      current = word
    } else {
      current = candidate
    }
  }
  if (current) lines.push(current)
  return lines.slice(0, 4)
}

const buildTitleText = (
  title: string,
  width: number,
  startY: number,
  color: string,
  fontSize: number,
): string => {
  const lines = wrapTitle(title, Math.floor(width / (fontSize * 0.62)))
  const spans = lines
    .map(
      (line, index) =>
        `<tspan x="${width / 2}" dy="${index === 0 ? 0 : fontSize * 1.25}">${escapeXml(line)}</tspan>`,
    )
    .join("")
  return `<text x="${width / 2}" y="${startY}" fill="${color}" font-family="Georgia, serif" font-size="${fontSize}" font-weight="bold" text-anchor="middle">${spans}</text>`
}

/**
 * Renders a small deterministic SVG cover so demo galleries have images
 * without any external image service. Palette, decoration motif, and (for
 * photos/recipes) intrinsic aspect ratio all vary with the seed.
 */
export const generateCoverSvg = ({ kind, seed, title }: CoverSvgOptions): string => {
  const random = createRandom(seed)
  const { height, width } = pickOne(random, COVER_DIMENSIONS[kind])
  const [dark, mid, light] = pickOne(random, PALETTES)
  const decoration = DECORATIONS[kind][randomInt(random, 0, DECORATIONS[kind].length - 1)]
  const titleColor = kind === "photo" ? "#ffffff" : light
  const titleY = kind === "book" || kind === "movie" ? 180 : height - 110
  const fontSize = kind === "photo" ? 34 : 38

  return (
    `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}">` +
    `<defs><linearGradient id="bg" x1="0" y1="0" x2="0" y2="1">` +
    `<stop offset="0" stop-color="${mid}"/><stop offset="1" stop-color="${dark}"/>` +
    `</linearGradient></defs>` +
    `<rect width="${width}" height="${height}" fill="url(#bg)"/>` +
    decoration({ accent: light, dark, height, mid, random, width }) +
    buildTitleText(title, width, titleY, titleColor, fontSize) +
    `</svg>`
  )
}
