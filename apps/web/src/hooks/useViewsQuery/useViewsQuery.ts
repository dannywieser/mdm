import { useSuspenseQuery } from "@tanstack/react-query"

import { translate } from "../../i18n"
import type { ViewsResponse } from "../../types/views"

import type { UseViewsQueryParams } from "./useViewsQuery.types"

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? "/api"

const fetchViews = async (): Promise<ViewsResponse> => {
  const response = await fetch(`${API_BASE_URL}/views`)

  if (!response.ok) {
    throw new Error(translate("errors.unableToLoadViews"))
  }

  return (await response.json()) as ViewsResponse
}

export const useViewsQuery = ({ staleTime }: UseViewsQueryParams = {}) =>
  useSuspenseQuery({
    queryKey: ["views"],
    queryFn: fetchViews,
    staleTime,
  })
