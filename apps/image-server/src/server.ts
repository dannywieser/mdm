import express from "express"
import { toLoggableError } from "mdm-util"
import morgan from "morgan"

import { healthHandler } from "./handlers/health/health"
import { createImageHandler, resolveImageProxyConfig } from "./handlers/images/images"

export const createApp = () => {
  const app = express()

  app.use(morgan("combined"))

  app.get("/health", healthHandler)
  app.get("/images", createImageHandler(resolveImageProxyConfig()))

  return app
}

if (require.main === module) {
  const app = createApp()
  const port = Number(process.env.PORT ?? 3002)

  app.listen(port, () => {
    console.log(`image-server listening on ${port}`)
  })

  process.on("unhandledRejection", (error) => {
    console.error("image-server unhandled rejection", toLoggableError(error))
  })
}
