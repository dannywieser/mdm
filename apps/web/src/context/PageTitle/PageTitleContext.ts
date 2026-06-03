import { createContext } from "react"

import type { PageTitleContextValue } from "./PageTitle.types"

export const PageTitleContext = createContext<PageTitleContextValue>({
  title: "",
  setTitle: () => {},
})
