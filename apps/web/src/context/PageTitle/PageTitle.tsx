import { createContext, useContext, useState, type ReactNode } from "react"

import type { PageTitleContextValue } from "./PageTitle.types"

const PageTitleContext = createContext<PageTitleContextValue>({
  title: "",
  setTitle: () => {},
})

export const PageTitleProvider = ({ children }: { children: ReactNode }) => {
  const [title, setTitle] = useState("")

  return (
    <PageTitleContext.Provider value={{ title, setTitle }}>
      {children}
    </PageTitleContext.Provider>
  )
}

export const usePageTitle = (): PageTitleContextValue =>
  useContext(PageTitleContext)
