import express from 'express'
import morgan from 'morgan'

export const createApp = () => {
  const app = express()

  app.use(morgan('combined'))

  app.get('/health', (_request, response) => {
    response.status(200).json({ status: 'ok' })
  })

  return app
}

if (require.main === module) {
  const app = createApp()
  const port = Number(process.env.PORT ?? 3000)

  app.listen(port, () => {
    console.log(`notes-api listening on ${port}`)
  })
}
