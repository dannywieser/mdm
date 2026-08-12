const IMAGE_EXTENSION_PATTERN = /\.(?:jpe?g|png|gif|webp|svg|bmp|avif|ico|tiff?)(?:[?#].*)?$/i

// Whether a URL or path's file extension indicates it points at an image, so a
// plain `[label](url)` link (e.g. Bear's inline-image-preview format) can be
// told apart from a link to a non-image resource. Ignores any trailing query
// string or fragment.
export const isImageUrl = (url: string): boolean => IMAGE_EXTENSION_PATTERN.test(url.trim())
