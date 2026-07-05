import type { ImageProxyParams } from "./images.types"

import { getImagesBaseUrl } from "../config"
import { isDemoMode } from "../demo/demoMode"
import { buildDemoImageUrl } from "../demo/demoUrls"

export const buildImageUrl = ({ path }: ImageProxyParams): string =>
  isDemoMode()
    ? buildDemoImageUrl(path)
    : `${getImagesBaseUrl()}/images?path=${encodeURIComponent(path)}`
