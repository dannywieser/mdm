import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'

import './index.css'

import App from './App'
import { ColorPaletteProvider } from './context/ColorPalette/ColorPalette'
import { I18nProvider } from './i18n'

const queryClient = new QueryClient()

createRoot(document.getElementById('root')!).render(
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
