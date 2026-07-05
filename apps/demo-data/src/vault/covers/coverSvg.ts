import type { CoverKind, CoverSvgOptions } from "./coverSvg.types"

import { createRandom, pickOne, randomInt } from "../random/random"

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

const COVER_SIZES: Record<CoverKind, { height: number; width: number }> = {
  book: { height: 600, width: 400 },
  movie: { height: 600, width: 400 },
  photo: { height: 600, width: 600 },
  recipe: { height: 600, width: 600 },
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

const buildDecoration = (
  kind: CoverKind,
  random: () => number,
  width: number,
  height: number,
  accent: string,
): string => {
  if (kind === "photo") {
    const sunX = randomInt(random, 100, width - 100)
    const peak = randomInt(random, 200, 320)
    return (
      `<circle cx="${sunX}" cy="150" r="${randomInt(random, 40, 70)}" fill="${accent}" opacity="0.9"/>` +
      `<polygon points="0,${height} 0,${peak + 140} ${width * 0.35},${peak} ${width * 0.7},${peak + 180} ${width},${peak + 60} ${width},${height}" fill="#00000055"/>`
    )
  }
  if (kind === "recipe") {
    return (
      `<circle cx="${width / 2}" cy="${height / 2 - 40}" r="130" fill="${accent}" opacity="0.35"/>` +
      `<circle cx="${width / 2}" cy="${height / 2 - 40}" r="90" fill="${accent}" opacity="0.6"/>`
    )
  }
  if (kind === "movie") {
    const bars = Array.from({ length: 6 }, (_, index) => {
      const x = 20 + index * ((width - 40) / 6)
      return `<rect x="${x}" y="20" width="24" height="24" rx="4" fill="${accent}" opacity="0.7"/>`
    })
    return bars.join("")
  }
  return `<rect x="0" y="0" width="26" height="${height}" fill="${accent}" opacity="0.65"/>`
}

/**
 * Renders a small deterministic SVG cover so demo galleries have images
 * without any external image service.
 */
export const generateCoverSvg = ({ kind, seed, title }: CoverSvgOptions): string => {
  const random = createRandom(seed)
  const { height, width } = COVER_SIZES[kind]
  const [dark, mid, light] = pickOne(random, PALETTES)
  const titleColor = kind === "photo" ? "#ffffff" : light
  const titleY = kind === "book" || kind === "movie" ? 180 : height - 110
  const fontSize = kind === "photo" ? 34 : 38

  return (
    `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}">` +
    `<defs><linearGradient id="bg" x1="0" y1="0" x2="0" y2="1">` +
    `<stop offset="0" stop-color="${mid}"/><stop offset="1" stop-color="${dark}"/>` +
    `</linearGradient></defs>` +
    `<rect width="${width}" height="${height}" fill="url(#bg)"/>` +
    buildDecoration(kind, random, width, height, light) +
    buildTitleText(title, width, titleY, titleColor, fontSize) +
    `</svg>`
  )
}
