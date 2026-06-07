import express from "express"
import morgan from "morgan"

import { habitHandler } from "./handlers/habit/habit"
import { habitsHandler } from "./handlers/habits/habits"
import { healthHandler } from "./handlers/health/health"

export const createApp = () => {
  const app = express()

  app.use(morgan("combined"))

  app.get("/health", healthHandler)
  app.get("/habits", habitsHandler)
  app.get("/habit/:id", habitHandler)

  return app
}

if (require.main === module) {
  const app = createApp()
  const port = Number(process.env.PORT ?? 3003)

  app.listen(port, () => {
    console.log(`habit-tracker listening on ${port}`)
  })
}
