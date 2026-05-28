import type { RequestHandler } from "express"

import {
  buildImgproxyUrl,
  DEFAULT_MAX_WIDTH,
  resolveImagePath,
} from "./images.util"

export interface ImageProxyConfig {
  imgproxyBaseUrl: string
  imagesRoot: string
  maxWidth: number
}

const copyHeaders = (
  target: Parameters<RequestHandler>[1],
  source: Headers,
): void => {
  const contentType = source.get("content-type")
  const cacheControl = source.get("cache-control")

  if (contentType) {
    target.setHeader("Content-Type", contentType)
  }

  if (cacheControl) {
    target.setHeader("Cache-Control", cacheControl)
  }
}

export const createImageHandler = (config: ImageProxyConfig): RequestHandler => {
  return async (request, response) => {
    const sourcePath =
      typeof request.query["path"] === "string" ? request.query["path"] : ""
    const resolvedImagePath = resolveImagePath(sourcePath)

    if (!resolvedImagePath) {
      response.status(400).json({ error: "A valid local image path is required" })
      return
    }

    const upstreamUrl = buildImgproxyUrl({
      imagePath: resolvedImagePath,
      imagesRoot: config.imagesRoot,
      imgproxyBaseUrl: config.imgproxyBaseUrl,
      maxWidth: config.maxWidth,
    })

    const upstreamResponse = await fetch(upstreamUrl)
    copyHeaders(response, upstreamResponse.headers)

    const bodyBuffer = Buffer.from(await upstreamResponse.arrayBuffer())

    if (!upstreamResponse.ok) {
      response.status(upstreamResponse.status).send(bodyBuffer)
      return
    }

    response.status(200).send(bodyBuffer)
  }
}

export const resolveImageProxyConfig = (): ImageProxyConfig => {
  const maxWidth = Number(process.env.IMAGE_MAX_WIDTH ?? DEFAULT_MAX_WIDTH)

  return {
    imgproxyBaseUrl: process.env.IMGPROXY_BASE_URL ?? "http://imgproxy:8080",
    imagesRoot: process.env.IMAGES_ROOT ?? "/data/images",
    maxWidth: Number.isFinite(maxWidth) && maxWidth > 0 ? maxWidth : DEFAULT_MAX_WIDTH,
  }
}
