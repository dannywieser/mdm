import type { RequestHandler } from "express"

import path from "node:path"

import type { ImageRedisClient } from "./images.types"

import { logger } from "../../logger"
import {
  buildImgproxyUrlPath,
  DEFAULT_MAX_HEIGHT,
  DEFAULT_MAX_WIDTH,
  resolveImagePath,
} from "./images.util"

export interface ImageProxyConfig {
  cacheTtlSeconds: number
  imgproxyEnabled: boolean
  imgproxyPathPrefix: string
  imagesRoot: string
  maxWidth: number
  maxHeight: number
}

const buildCacheKey = (resolvedPath: string, maxWidth: number, maxHeight: number): string =>
  `image:${resolvedPath}:${maxWidth}:${maxHeight}`

export const createImageHandler = (
  config: ImageProxyConfig,
  redisClient: ImageRedisClient,
): RequestHandler => {
  return async (request, response) => {
    const sourcePath =
      typeof request.query.path === "string" ? request.query.path : ""
    const resolvedImagePath = resolveImagePath(sourcePath)

    if (!resolvedImagePath) {
      logger.error({ sourcePath }, "invalid path rejected")
      response.status(400).json({ error: "A valid local image path is required" })
      return
    }

    if (!config.imgproxyEnabled) {
      const fullPath = path.join(config.imagesRoot, resolvedImagePath)
      logger.debug({ fullPath }, "serving image directly")
      response.sendFile(fullPath)
      return
    }

    const cacheKey = buildCacheKey(resolvedImagePath, config.maxWidth, config.maxHeight)

    try {
      const cached = await redisClient.get(cacheKey)
      if (cached) {
        logger.debug({ resolvedImagePath }, "image cache hit")
        response.redirect(307, cached)
        return
      }
    } catch {
      // treat Redis read failure as a cache miss
    }

    const upstreamPath = buildImgproxyUrlPath({
      imagePath: resolvedImagePath,
      imagesRoot: config.imagesRoot,
      maxWidth: config.maxWidth,
      maxHeight: config.maxHeight,
    })

    const redirectUrl = `${config.imgproxyPathPrefix}${upstreamPath}`

    logger.debug({ redirectUrl, resolvedImagePath }, "image cache miss, redirecting")

    try {
      await redisClient.set(cacheKey, redirectUrl, { EX: config.cacheTtlSeconds })
    } catch {
      // non-fatal — redirect still works without caching
    }

    response.redirect(307, redirectUrl)
  }
}

export const resolveImageProxyConfig = (): ImageProxyConfig => {
  const maxWidth = Number(process.env.IMAGE_MAX_WIDTH ?? DEFAULT_MAX_WIDTH)
  const maxHeight = Number(process.env.IMAGE_MAX_HEIGHT ?? DEFAULT_MAX_HEIGHT)
  const cacheTtlSeconds = Number(process.env.IMAGE_CACHE_TTL_SECONDS ?? 86400)

  return {
    cacheTtlSeconds: Number.isFinite(cacheTtlSeconds) && cacheTtlSeconds > 0 ? cacheTtlSeconds : 86400,
    imgproxyEnabled: process.env.IMAGE_PROXY_ENABLED !== "false",
    imgproxyPathPrefix: process.env.IMGPROXY_PATH_PREFIX ?? "/imgproxy",
    imagesRoot: process.env.IMAGES_ROOT ?? "/data/images",
    maxWidth: Number.isFinite(maxWidth) && maxWidth > 0 ? maxWidth : DEFAULT_MAX_WIDTH,
    maxHeight: Number.isFinite(maxHeight) && maxHeight > 0 ? maxHeight : DEFAULT_MAX_HEIGHT,
  }
}
