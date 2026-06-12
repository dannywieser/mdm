import type { ImageProxyParams } from "./images.types"

import { getImagesBaseUrl } from "../config"

export const buildImageUrl = ({ path }: ImageProxyParams): string =>
  `${getImagesBaseUrl()}/images?path=${encodeURIComponent(path)}`
