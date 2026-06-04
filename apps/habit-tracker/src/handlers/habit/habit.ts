import type { RequestHandler } from "express"

export const habitHandler: RequestHandler = (_request, response) => {
  response.status(200).json({})
}
