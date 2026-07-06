import type { RequestHandler } from "express"

import { assertDirectoryReadable } from "mdm-util/node"

import { resolveImageProxyConfig } from "../images/images"

export const healthHandler: RequestHandler = async (_request, response) => {
  try {
    const { imagesRoot } = resolveImageProxyConfig()

    await assertDirectoryReadable(imagesRoot)

    response.status(200).json({ status: "ok" })
  } catch (error) {
    response.status(503).json({
      error: error instanceof Error ? error.message : "Unknown error",
      status: "error",
    })
  }
}
