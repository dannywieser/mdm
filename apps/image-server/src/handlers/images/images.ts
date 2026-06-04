import type { RequestHandler } from "express"

import type { ImageRedisClient } from "./images.types"

import {
  buildImgproxyUrlPath,
  DEFAULT_MAX_WIDTH,
  resolveImagePath,
} from "./images.util"

export interface ImageProxyConfig {
  cacheTtlSeconds: number
  imgproxyPathPrefix: string
  imagesRoot: string
  maxWidth: number
}

const buildCacheKey = (resolvedPath: string, maxWidth: number): string =>
  `image:${resolvedPath}:${maxWidth}`

export const createImageHandler = (
  config: ImageProxyConfig,
  redisClient: ImageRedisClient,
): RequestHandler => {
  return async (request, response) => {
    const sourcePath =
      typeof request.query["path"] === "string" ? request.query["path"] : ""
    const resolvedImagePath = resolveImagePath(sourcePath)

    if (!resolvedImagePath) {
      response.status(400).json({ error: "A valid local image path is required" })
      return
    }

    const cacheKey = buildCacheKey(resolvedImagePath, config.maxWidth)
    const cached = await redisClient.get(cacheKey)

    if (cached) {
      response.redirect(307, cached)
      return
    }

    const upstreamPath = buildImgproxyUrlPath({
      imagePath: resolvedImagePath,
      imagesRoot: config.imagesRoot,
      maxWidth: config.maxWidth,
    })

    const redirectUrl = `${config.imgproxyPathPrefix}${upstreamPath}`

    await redisClient.set(cacheKey, redirectUrl, { EX: config.cacheTtlSeconds })

    response.redirect(307, redirectUrl)
  }
}

export const resolveImageProxyConfig = (): ImageProxyConfig => {
  const maxWidth = Number(process.env.IMAGE_MAX_WIDTH ?? DEFAULT_MAX_WIDTH)
  const cacheTtlSeconds = Number(process.env.IMAGE_CACHE_TTL_SECONDS ?? 86400)

  return {
    cacheTtlSeconds: Number.isFinite(cacheTtlSeconds) && cacheTtlSeconds > 0 ? cacheTtlSeconds : 86400,
    imgproxyPathPrefix: process.env.IMGPROXY_PATH_PREFIX ?? "/imgproxy",
    imagesRoot: process.env.IMAGES_ROOT ?? "/data/images",
    maxWidth: Number.isFinite(maxWidth) && maxWidth > 0 ? maxWidth : DEFAULT_MAX_WIDTH,
  }
}
