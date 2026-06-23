import type { Request } from "express"

export const getQueryView = (request: Request): string | undefined => {
  const view = request.query.view
  if (typeof view === "string") {
    return view
  }
  return undefined
}

export const getQueryIncludeContent = (request: Request): boolean => {
  const includeContent = request.query.includeContent
  if (typeof includeContent === "string") {
    return includeContent !== "false"
  }
  return true
}
