import type { RequestHandler } from "express"

import { access, constants } from "node:fs/promises"

import { resolveImageProxyConfig } from "../images/images"

export const healthHandler: RequestHandler = async (_request, response) => {
  try {
    const { imagesRoot } = resolveImageProxyConfig()

    await access(imagesRoot, constants.R_OK)

    response.status(200).json({ status: "ok" })
  } catch (error) {
    response.status(503).json({
      error: error instanceof Error ? error.message : "Unknown error",
      status: "error",
    })
  }
}
