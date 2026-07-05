import { useSuspenseQuery } from "@tanstack/react-query"

import type { ViewsResponse } from "../../views.types"
import type { UseViewsQueryParams } from "./useViewsQuery.types"

import { getBaseUrl } from "../../../config"
import { isDemoMode } from "../../../demo/demoMode"
import { buildDemoViewsUrl } from "../../../demo/demoUrls"

const fetchViews = async (): Promise<ViewsResponse> => {
  const url = isDemoMode() ? buildDemoViewsUrl() : `${getBaseUrl()}/views`
  const response = await fetch(url)

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
