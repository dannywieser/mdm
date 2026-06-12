import { getImagesBaseUrl } from "../config"

import type { ImageProxyParams } from "./images.types"

export const buildImageUrl = ({ path }: ImageProxyParams): string =>
  `${getImagesBaseUrl()}/images?path=${encodeURIComponent(path)}`
