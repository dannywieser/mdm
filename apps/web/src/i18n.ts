import {
  createContext,
  createElement,
  type ReactNode,
  useContext,
} from "react"

type Locale = "en"
type TranslationKey =
  | "errors.unableToLoadNotes"
  | "notes.errorTitle"
  | "notes.header"
  | "notes.linkedNotes"
  | "notes.meta"
  | "notes.openInObsidian"
  | "terminal.appName"
  | "terminal.ready"
  | "terminal.inputPlaceholder"

const translations: Record<Locale, Record<TranslationKey, string>> = {
  en: {
    "errors.unableToLoadNotes": "Unable to load notes",
    "notes.errorTitle": "Unable to load notes.",
    "notes.header": "Notes",
    "notes.linkedNotes": "Linked Notes",
    "notes.meta": "Vault: {vault} · Directory: {directory}",
    "notes.openInObsidian": "Open in Obsidian",
    "terminal.appName": "mdm",
    "terminal.ready": "Ready.",
    "terminal.inputPlaceholder": "type a command...",
  },
}

const interpolate = (
  template: string,
  values?: Record<string, string | number>,
): string =>
  template.replace(/\{(\w+)\}/g, (_, key: string) =>
    values && key in values ? String(values[key]) : `{${key}}`,
  )

export const translate = (
  key: TranslationKey,
  values?: Record<string, string | number>,
  locale: Locale = "en",
): string => interpolate(translations[locale][key], values)

interface I18nContextValue {
  locale: Locale
  t: (key: TranslationKey, values?: Record<string, string | number>) => string
}

const i18nContext = createContext<I18nContextValue>({
  locale: "en",
  t: (key, values) => translate(key, values),
})

interface I18nProviderProps {
  children: ReactNode
  locale?: Locale
}

export const I18nProvider = ({ children, locale = "en" }: I18nProviderProps) => {
  const t = (key: TranslationKey, values?: Record<string, string | number>) =>
    translate(key, values, locale)

  return createElement(i18nContext.Provider, { value: { locale, t } }, children)
}

export const useI18n = (): I18nContextValue => useContext(i18nContext)
