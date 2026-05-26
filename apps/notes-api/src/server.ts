import express from 'express'
import morgan from 'morgan'

import { healthHandler } from './handlers/health'
import { notesHandler } from './handlers/notes'

export const createApp = () => {
  const app = express()

  app.use(morgan('combined'))

  app.get('/health', healthHandler)
  app.get('/notes', notesHandler)

  return app
}

if (require.main === module) {
  const app = createApp()
  const port = Number(process.env.PORT ?? 3000)

  app.listen(port, () => {
    console.log(`notes-api listening on ${port}`)
  })
}
