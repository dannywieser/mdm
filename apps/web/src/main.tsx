import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { setBaseUrl, setFlagsBaseUrl, setHabitsBaseUrl, setImagesBaseUrl, setStatsBaseUrl } from 'services'

import './index.css'

import App from './App'
import { ColorPaletteProvider } from './context/ColorPalette/ColorPalette'
import { I18nProvider } from './i18n'

setBaseUrl(import.meta.env.VITE_API_BASE_URL ?? '/api')
setHabitsBaseUrl(import.meta.env.VITE_HABIT_API_BASE_URL ?? '')
setFlagsBaseUrl(import.meta.env.VITE_FLAGS_BASE_URL ?? '/flags')
setImagesBaseUrl(import.meta.env.VITE_IMAGES_BASE_URL ?? '')
setStatsBaseUrl(import.meta.env.VITE_STATS_BASE_URL ?? '/stats')

const queryClient = new QueryClient()

const rootElement = document.getElementById('root')
if (!rootElement) throw new Error('Root element not found')
createRoot(rootElement).render(
  <StrictMode>
    <ColorPaletteProvider>
      <QueryClientProvider client={queryClient}>
        <BrowserRouter>
          <I18nProvider>
            <App />
          </I18nProvider>
        </BrowserRouter>
      </QueryClientProvider>
    </ColorPaletteProvider>
  </StrictMode>
)

document.documentElement.classList.remove('splash-loading')
