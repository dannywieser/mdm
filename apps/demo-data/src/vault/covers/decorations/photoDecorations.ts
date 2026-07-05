import type { CoverDecoration } from "../coverSvg.types"

import { randomInt } from "../../random/random"

const mountains: CoverDecoration = ({ accent, height, random, width }) => {
  const sunX = randomInt(random, 100, width - 100)
  const peak = randomInt(random, Math.round(height * 0.35), Math.round(height * 0.55))
  return (
    `<circle cx="${sunX}" cy="${Math.round(height * 0.25)}" r="${randomInt(random, 40, 70)}" fill="${accent}" opacity="0.9"/>` +
    `<polygon points="0,${height} 0,${peak + 140} ${width * 0.35},${peak} ${width * 0.7},${peak + 180} ${width},${peak + 60} ${width},${height}" fill="#00000055"/>`
  )
}

const rollingHills: CoverDecoration = ({ accent, height, random, width }) => {
  const horizon = Math.round(height * 0.62)
  return (
    `<circle cx="${randomInt(random, 80, width - 80)}" cy="${Math.round(height * 0.2)}" r="${randomInt(random, 35, 60)}" fill="${accent}" opacity="0.85"/>` +
    `<ellipse cx="${Math.round(width * 0.25)}" cy="${height}" rx="${Math.round(width * 0.7)}" ry="${height - horizon}" fill="#00000044"/>` +
    `<ellipse cx="${Math.round(width * 0.85)}" cy="${height + 30}" rx="${Math.round(width * 0.65)}" ry="${height - horizon + 60}" fill="#00000066"/>`
  )
}

const skyline: CoverDecoration = ({ height, random, width }) => {
  const buildingCount = 7
  const buildingWidth = width / buildingCount
  const buildings = Array.from({ length: buildingCount }, (_, index) => {
    const buildingHeight = randomInt(random, Math.round(height * 0.2), Math.round(height * 0.5))
    return `<rect x="${Math.round(index * buildingWidth)}" y="${height - buildingHeight}" width="${Math.ceil(buildingWidth - 6)}" height="${buildingHeight}" fill="#00000055"/>`
  })
  return buildings.join("")
}

const lakeReflection: CoverDecoration = ({ accent, height, random, width }) => {
  const horizon = Math.round(height * 0.55)
  const sunX = randomInt(random, 120, width - 120)
  return (
    `<rect x="0" y="${horizon}" width="${width}" height="${height - horizon}" fill="#00000033"/>` +
    `<circle cx="${sunX}" cy="${horizon - 70}" r="48" fill="${accent}" opacity="0.9"/>` +
    `<ellipse cx="${sunX}" cy="${horizon + 70}" rx="48" ry="26" fill="${accent}" opacity="0.35"/>` +
    `<rect x="0" y="${horizon + 30}" width="${width}" height="6" fill="${accent}" opacity="0.2"/>` +
    `<rect x="0" y="${horizon + 60}" width="${width}" height="4" fill="${accent}" opacity="0.15"/>`
  )
}

const forest: CoverDecoration = ({ height, random, width }) => {
  const treeCount = 6
  const treeWidth = width / treeCount
  const trees = Array.from({ length: treeCount }, (_, index) => {
    const treeHeight = randomInt(random, Math.round(height * 0.25), Math.round(height * 0.45))
    const centerX = Math.round(index * treeWidth + treeWidth / 2)
    return `<polygon points="${Math.round(centerX - treeWidth / 2)},${height} ${centerX},${height - treeHeight} ${Math.round(centerX + treeWidth / 2)},${height}" fill="#00000055"/>`
  })
  return trees.join("")
}

const nightSky: CoverDecoration = ({ accent, height, random, width }) => {
  const stars = Array.from({ length: 24 }, () =>
    `<circle cx="${randomInt(random, 10, width - 10)}" cy="${randomInt(random, 10, Math.round(height * 0.6))}" r="${randomInt(random, 1, 3)}" fill="${accent}" opacity="0.9"/>`,
  )
  const moonX = randomInt(random, 100, width - 100)
  return (
    stars.join("") +
    `<circle cx="${moonX}" cy="${Math.round(height * 0.22)}" r="42" fill="${accent}"/>` +
    `<circle cx="${moonX + 18}" cy="${Math.round(height * 0.2)}" r="38" fill="#00000066"/>` +
    `<rect x="0" y="${Math.round(height * 0.8)}" width="${width}" height="${Math.round(height * 0.2)}" fill="#00000066"/>`
  )
}

export const PHOTO_DECORATIONS: readonly CoverDecoration[] = [
  mountains,
  rollingHills,
  skyline,
  lakeReflection,
  forest,
  nightSky,
]
