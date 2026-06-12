import { useSuspenseQuery } from "@tanstack/react-query"

import type { ViewsResponse } from "../../views.types"
import type { UseViewsQueryParams } from "./useViewsQuery.types"

import { getBaseUrl } from "../../../config"

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
