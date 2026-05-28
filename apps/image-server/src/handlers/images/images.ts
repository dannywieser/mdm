import type { RequestHandler } from "express"

import {
  buildImgproxyUrlPath,
  DEFAULT_MAX_WIDTH,
  resolveImagePath,
} from "./images.util"

export interface ImageProxyConfig {
  imgproxyPathPrefix: string
  imagesRoot: string
  maxWidth: number
}

export const createImageHandler = (config: ImageProxyConfig): RequestHandler => {
  return (request, response) => {
    const sourcePath =
      typeof request.query["path"] === "string" ? request.query["path"] : ""
    const resolvedImagePath = resolveImagePath(sourcePath)

    if (!resolvedImagePath) {
      response.status(400).json({ error: "A valid local image path is required" })
      return
    }

    const upstreamPath = buildImgproxyUrlPath({
      imagePath: resolvedImagePath,
      imagesRoot: config.imagesRoot,
      maxWidth: config.maxWidth,
    })

    response.redirect(307, `${config.imgproxyPathPrefix}${upstreamPath}`)
  }
}

export const resolveImageProxyConfig = (): ImageProxyConfig => {
  const maxWidth = Number(process.env.IMAGE_MAX_WIDTH ?? DEFAULT_MAX_WIDTH)

  return {
    imgproxyPathPrefix: process.env.IMGPROXY_PATH_PREFIX ?? "/imgproxy",
    imagesRoot: process.env.IMAGES_ROOT ?? "/data/images",
    maxWidth: Number.isFinite(maxWidth) && maxWidth > 0 ? maxWidth : DEFAULT_MAX_WIDTH,
  }
}
