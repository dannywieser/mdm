import type { CoverDecoration } from "../coverSvg.types"

import { randomInt } from "../../random/random"

const plate: CoverDecoration = ({ accent, height, width }) => {
  const centerY = Math.round(height / 2) - 40
  return (
    `<circle cx="${width / 2}" cy="${centerY}" r="130" fill="${accent}" opacity="0.35"/>` +
    `<circle cx="${width / 2}" cy="${centerY}" r="90" fill="${accent}" opacity="0.6"/>`
  )
}

const bowl: CoverDecoration = ({ accent, height, width }) => {
  const bowlY = Math.round(height * 0.55)
  const steam = (x: number) =>
    `<rect x="${x}" y="${bowlY - 130}" width="8" height="60" rx="4" fill="${accent}" opacity="0.45"/>`
  return (
    `<path d="M ${width / 2 - 140} ${bowlY} A 140 120 0 0 0 ${width / 2 + 140} ${bowlY} Z" fill="${accent}" opacity="0.55"/>` +
    `<rect x="${width / 2 - 60}" y="${bowlY + 116}" width="120" height="14" rx="7" fill="${accent}" opacity="0.4"/>` +
    steam(width / 2 - 40) +
    steam(width / 2) +
    steam(width / 2 + 40)
  )
}

const checker: CoverDecoration = ({ accent, height, random, width }) => {
  const size = 44
  const columns = Math.ceil(width / size)
  const rows = randomInt(random, 2, 3)
  const squares: string[] = []
  for (let row = 0; row < rows; row += 1) {
    for (let column = 0; column < columns; column += 1) {
      if ((row + column) % 2 === 0) {
        squares.push(
          `<rect x="${column * size}" y="${row * size}" width="${size}" height="${size}" fill="${accent}" opacity="0.35"/>`,
        )
      }
    }
  }
  return squares.join("") + `<rect x="0" y="${height - 16}" width="${width}" height="16" fill="${accent}" opacity="0.3"/>`
}

const citrus: CoverDecoration = ({ accent, height, random, width }) => {
  const centerX = randomInt(random, Math.round(width * 0.35), Math.round(width * 0.65))
  const centerY = Math.round(height * 0.42)
  const segments = Array.from({ length: 8 }, (_, index) => {
    const angle = (index * Math.PI) / 4
    return `<line x1="${centerX}" y1="${centerY}" x2="${Math.round(centerX + Math.cos(angle) * 108)}" y2="${Math.round(centerY + Math.sin(angle) * 108)}" stroke="${accent}" stroke-width="7" opacity="0.5"/>`
  })
  return (
    `<circle cx="${centerX}" cy="${centerY}" r="120" fill="${accent}" opacity="0.3"/>` +
    `<circle cx="${centerX}" cy="${centerY}" r="112" fill="none" stroke="${accent}" stroke-width="8" opacity="0.55"/>` +
    segments.join("")
  )
}

export const RECIPE_DECORATIONS: readonly CoverDecoration[] = [
  plate,
  bowl,
  checker,
  citrus,
]
