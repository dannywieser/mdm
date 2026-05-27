import { resolveNotesConfig } from "app-config"
import express from "express"
import morgan from "morgan"

import { healthHandler } from "./handlers/health/health"
import { notesHandler } from "./handlers/notes/notes"
import { toLoggableError } from "./logging"

export const createApp = () => {
  const app = express()

  app.use(morgan("combined"))

  app.get("/health", healthHandler)
  app.get("/notes", notesHandler)

  return app
}

export const logStartupConfig = async (): Promise<void> => {
  try {
    const notesConfig = await resolveNotesConfig()

    console.log("Resolved notes config", JSON.stringify(notesConfig, null, 2))
  } catch (error) {
    console.error(
      "Unable to resolve notes config on startup",
      toLoggableError(error),
    )
  }
}

if (require.main === module) {
  const app = createApp()
  const port = Number(process.env.PORT ?? 3000)

  app.listen(port, () => {
    console.log(`notes-api listening on ${port}`)
    void logStartupConfig()
  })
}
