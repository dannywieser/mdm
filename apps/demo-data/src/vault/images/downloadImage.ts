const downloadCache = new Map<string, Promise<Buffer | null>>()

const fetchImage = async (url: string): Promise<Buffer | null> => {
  try {
    const response = await fetch(url)
    if (!response.ok) {
      console.warn(`[demo-data] image download failed (${String(response.status)}): ${url}`)
      return null
    }
    return Buffer.from(await response.arrayBuffer())
  } catch (error) {
    console.warn(`[demo-data] image download failed: ${url}`, error)
    return null
  }
}

/**
 * Downloads an image, returning `null` on any failure so callers can fall
 * back rather than throwing. Repeated calls for the same URL (a thematic
 * photo reused across several notes) resolve from an in-memory cache instead
 * of re-downloading.
 */
export const downloadImage = (url: string): Promise<Buffer | null> => {
  const cached = downloadCache.get(url)
  if (cached) return cached

  const pending = fetchImage(url)
  downloadCache.set(url, pending)
  return pending
}
