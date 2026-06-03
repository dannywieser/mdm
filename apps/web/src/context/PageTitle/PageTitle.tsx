import { useState, type ReactNode } from "react"

import { PageTitleContext } from "./PageTitleContext"

export const PageTitleProvider = ({ children }: { children: ReactNode }) => {
  const [title, setTitle] = useState("")

  return (
    <PageTitleContext.Provider value={{ title, setTitle }}>
      {children}
    </PageTitleContext.Provider>
  )
}
