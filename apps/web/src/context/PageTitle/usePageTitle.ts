import { useContext } from "react"

import { PageTitleContext } from "./PageTitleContext"
import type { PageTitleContextValue } from "./PageTitle.types"

export const usePageTitle = (): PageTitleContextValue =>
  useContext(PageTitleContext)
