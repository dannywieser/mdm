import path from "node:path"

const EXTERNAL_SOURCE_PATTERN = /^[a-zA-Z][a-zA-Z\d+.-]*:/

export const DEFAULT_MAX_WIDTH = 1600
export const DEFAULT_MAX_HEIGHT = 1200

interface BuildImgproxyUrlOptions {
  imagePath: string
  imagesRoot: string
  maxWidth: number
  maxHeight: number
}

export const resolveImagePath = (imagePath: string): string | null => {
  const normalizedPath = imagePath.trim()

  if (!normalizedPath || EXTERNAL_SOURCE_PATTERN.test(normalizedPath)) {
    return null
  }

  const withoutLeadingSlash = normalizedPath.replace(/^\/+/, "")
  const sanitizedPath = path.posix.normalize(withoutLeadingSlash)

  if (
    sanitizedPath === "." ||
    sanitizedPath === "" ||
    sanitizedPath.startsWith("../") ||
    sanitizedPath === ".."
  ) {
    return null
  }

  return sanitizedPath
}

export const buildImgproxyUrlPath = ({
  imagePath,
  imagesRoot,
  maxWidth,
  maxHeight,
}: BuildImgproxyUrlOptions): string => {
  const sourcePath = path.posix.join(imagesRoot, imagePath)
  const sourceUrl = encodeURI(`local://${sourcePath}`)
  const resizeOption = `rs:fit:${maxWidth}:${maxHeight}:0`

  return `/unsafe/${resizeOption}/plain/${sourceUrl}`
}
