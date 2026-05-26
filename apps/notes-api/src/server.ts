import express from 'express'
import morgan from 'morgan'

import { healthHandler } from './handlers/health'

export const createApp = () => {
  const app = express()

  app.use(morgan('combined'))

  app.get('/health', healthHandler)

  return app
}

if (require.main === module) {
  const app = createApp()
  const port = Number(process.env.PORT ?? 3000)

  app.listen(port, () => {
    console.log(`notes-api listening on ${port}`)
  })
}
