import type { RequestHandler } from "express"

import path from "node:path"

import type { ImageRedisClient } from "./images.types"

import {
  buildImgproxyUrlPath,
  DEFAULT_MAX_WIDTH,
  resolveImagePath,
} from "./images.util"

export interface ImageProxyConfig {
  cacheTtlSeconds: number
  imgproxyEnabled: boolean
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
      console.error("[image-server] invalid path rejected", { sourcePath })
      response.status(400).json({ error: "A valid local image path is required" })
      return
    }

    if (!config.imgproxyEnabled) {
      const fullPath = path.join(config.imagesRoot, resolvedImagePath)
      console.debug("[image-server] serving directly", { fullPath })
      response.sendFile(fullPath)
      return
    }

    const cacheKey = buildCacheKey(resolvedImagePath, config.maxWidth)

    try {
      const cached = await redisClient.get(cacheKey)
      if (cached) {
        console.debug("[image-server] cache hit", { resolvedImagePath })
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
    })

    const redirectUrl = `${config.imgproxyPathPrefix}${upstreamPath}`

    console.debug("[image-server] cache miss, redirecting", { resolvedImagePath, redirectUrl })

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
  const cacheTtlSeconds = Number(process.env.IMAGE_CACHE_TTL_SECONDS ?? 86400)

  return {
    cacheTtlSeconds: Number.isFinite(cacheTtlSeconds) && cacheTtlSeconds > 0 ? cacheTtlSeconds : 86400,
    imgproxyEnabled: process.env.IMAGE_PROXY_ENABLED !== "false",
    imgproxyPathPrefix: process.env.IMGPROXY_PATH_PREFIX ?? "/imgproxy",
    imagesRoot: process.env.IMAGES_ROOT ?? "/data/images",
    maxWidth: Number.isFinite(maxWidth) && maxWidth > 0 ? maxWidth : DEFAULT_MAX_WIDTH,
  }
}
