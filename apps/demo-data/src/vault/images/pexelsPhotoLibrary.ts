import type { PexelsCategory, PexelsPhoto } from "./pexelsPhoto.types"

import library from "./pexelsPhotos.json"

/** All curated Pexels photos for a category. */
export const getPhotoPool = (category: PexelsCategory): readonly PexelsPhoto[] => library[category]

/** Finds a specific curated photo by its stable key (e.g. a recipe slug). */
export const findPhotoByKey = (
  category: PexelsCategory,
  key: string,
): PexelsPhoto | undefined => getPhotoPool(category).find((photo) => photo.key === key)
