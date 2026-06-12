import { useSuspenseQuery } from "@tanstack/react-query"

import { getBaseUrl } from "../config"

import type { ViewsResponse } from "./views.types"
import type { UseViewsQueryParams } from "./useViewsQuery.types"

const fetchViews = async (): Promise<ViewsResponse> => {
  const response = await fetch(`${getBaseUrl()}/views`)

  if (!response.ok) {
    throw new Error("errors.unableToLoadViews")
  }

  return (await response.json()) as ViewsResponse
}

export const useViewsQuery = ({ staleTime }: UseViewsQueryParams = {}) =>
  useSuspenseQuery({
    queryKey: ["views"],
    queryFn: fetchViews,
    staleTime,
  })
