import { isExternalUrl } from "mdm-util"

import type { NoteFrontmatter } from "../types"

import { extractImagePaths } from "./extractImagePaths"
import { resolveLocalImagePath } from "./resolveLocalImagePath"

const resolveImagePath = (
  rawPath: string,
  noteRelativePath: string,
  attachmentsDirectory: string,
): string | null => {
  const trimmedPath = rawPath.trim()
  if (!trimmedPath || trimmedPath.startsWith("#")) return null
  if (isExternalUrl(trimmedPath)) return trimmedPath
  return resolveLocalImagePath(trimmedPath, noteRelativePath, attachmentsDirectory)
}

const omitImages = (frontmatter: NoteFrontmatter): NoteFrontmatter =>
  Object.fromEntries(
    Object.entries(frontmatter).filter(([key]) => key !== "images"),
  )

// Derives frontmatter.images from every image found in a note's raw body (see
// extractImagePaths), replacing any images value already present in frontmatter.
// Returns null when there's neither frontmatter nor any images.
export const resolveFrontmatterImages = (
  frontmatter: NoteFrontmatter | null,
  body: string,
  noteRelativePath: string,
  attachmentsDirectory: string,
): NoteFrontmatter | null => {
  const resolvedImagePaths = extractImagePaths(body)
    .map((imagePath) => resolveImagePath(imagePath, noteRelativePath, attachmentsDirectory))
    .filter((imagePath): imagePath is string => imagePath !== null)

  const restFrontmatter = frontmatter ? omitImages(frontmatter) : null

  if (resolvedImagePaths.length === 0) {
    return restFrontmatter && Object.keys(restFrontmatter).length > 0 ? restFrontmatter : null
  }

  return { ...restFrontmatter, images: resolvedImagePaths }
}
