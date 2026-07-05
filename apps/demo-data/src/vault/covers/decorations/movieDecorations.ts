import type { CoverDecoration } from "../coverSvg.types"

import { randomInt } from "../../random/random"

const filmstrip: CoverDecoration = ({ accent, height, width }) => {
  const frame = (y: number) =>
    Array.from({ length: 6 }, (_, index) => {
      const x = 20 + index * ((width - 40) / 6)
      return `<rect x="${x}" y="${y}" width="24" height="24" rx="4" fill="${accent}" opacity="0.7"/>`
    }).join("")
  return frame(20) + frame(height - 44)
}

const spotlight: CoverDecoration = ({ accent, height, random, width }) => {
  const beamX = randomInt(random, Math.round(width * 0.3), Math.round(width * 0.7))
  return (
    `<polygon points="${beamX},0 ${beamX - 150},${height} ${beamX + 150},${height}" fill="${accent}" opacity="0.18"/>` +
    `<circle cx="${beamX}" cy="${Math.round(height * 0.72)}" r="60" fill="${accent}" opacity="0.3"/>`
  )
}

const retroSun: CoverDecoration = ({ accent, height, width }) => {
  const centerY = Math.round(height * 0.72)
  const stripes = Array.from({ length: 4 }, (_, index) =>
    `<rect x="0" y="${centerY + 12 + index * 22}" width="${width}" height="10" fill="${accent}" opacity="${0.4 - index * 0.08}"/>`,
  )
  return (
    `<circle cx="${width / 2}" cy="${centerY}" r="110" fill="${accent}" opacity="0.45"/>` +
    stripes.join("")
  )
}

const reel: CoverDecoration = ({ accent, height, random, width }) => {
  const centerY = Math.round(height * 0.68)
  const centerX = width / 2
  const holes = Array.from({ length: 6 }, (_, index) => {
    const angle = (index * Math.PI) / 3 + random() * 0.3
    return `<circle cx="${Math.round(centerX + Math.cos(angle) * 52)}" cy="${Math.round(centerY + Math.sin(angle) * 52)}" r="14" fill="${accent}" opacity="0.55"/>`
  })
  return (
    `<circle cx="${centerX}" cy="${centerY}" r="90" fill="none" stroke="${accent}" stroke-width="8" opacity="0.5"/>` +
    holes.join("") +
    `<circle cx="${centerX}" cy="${centerY}" r="16" fill="${accent}" opacity="0.7"/>`
  )
}

export const MOVIE_DECORATIONS: readonly CoverDecoration[] = [
  filmstrip,
  spotlight,
  retroSun,
  reel,
]
