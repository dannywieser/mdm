/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_API_BASE_URL?: string
  readonly VITE_HABIT_API_BASE_URL?: string
  readonly VITE_FLAGS_BASE_URL?: string
  readonly VITE_IMAGES_BASE_URL?: string
  readonly VITE_STATS_BASE_URL?: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
