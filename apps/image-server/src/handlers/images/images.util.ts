import path from "node:path"

const EXTERNAL_SOURCE_PATTERN = /^[a-zA-Z][a-zA-Z\d+.-]*:/

export const DEFAULT_MAX_WIDTH = 1600

interface BuildImgproxyUrlOptions {
  imagePath: string
  imagesRoot: string
  imgproxyBaseUrl: string
  maxWidth: number
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

export const buildImgproxyUrl = ({
  imagePath,
  imagesRoot,
  imgproxyBaseUrl,
  maxWidth,
}: BuildImgproxyUrlOptions): string => {
  const sourcePath = path.posix.join(imagesRoot, imagePath)
  const sourceUrl = encodeURI(`local://${sourcePath}`)
  const resizeOption = `rs:fit:${maxWidth}:0:0`

  return `${imgproxyBaseUrl}/unsafe/${resizeOption}/plain/${sourceUrl}`
}
