import { useEffect } from 'react'

const APP_NAME = 'mdm'

export const useDocumentTitle = (lastCommand: string | null) => {
  useEffect(() => {
    document.title = lastCommand ? `${APP_NAME} | ${lastCommand}` : APP_NAME
  }, [lastCommand])
}
