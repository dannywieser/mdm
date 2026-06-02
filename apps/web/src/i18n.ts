import { createContext, createElement, type ReactNode, useContext } from "react"

type Locale = "en"
type TranslationKey =
  | "home.modifiedToday"
  | "home.notes"
  | "errors.unableToLoadNotes"
  | "errors.unableToLoadReadState"
  | "errors.unableToLoadStats"
  | "errors.unableToToggleReadState"
  | "notes.errorTitle"
  | "notes.header"
  | "notes.linkedNotes"
  | "notes.markAsRead"
  | "notes.markAsUnread"
  | "notes.meta"
  | "review.allCaughtUp"
  | "review.progress"
  | "review.skip"

const translations: Record<Locale, Record<TranslationKey, string>> = {
  en: {
    "home.modifiedToday": "modified today",
    "home.notes": "notes",
    "errors.unableToLoadNotes": "well, that didn't go as planned",
    "errors.unableToLoadReadState": "unable to load read state",
    "errors.unableToLoadStats": "unable to load stats",
    "errors.unableToToggleReadState": "unable to toggle read state",
    "notes.errorTitle": "unable to load notes",
    "notes.header": "notes",
    "notes.linkedNotes": "linked notes",
    "notes.markAsRead": "mark as read",
    "notes.markAsUnread": "mark as unread",
    "notes.meta": "Vault: {vault} · Directory: {directory}",
    "review.allCaughtUp": "all caught up!",
    "review.progress": "{current} of {total}",
    "review.skip": "skip",
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

export const I18nProvider = ({
  children,
  locale = "en",
}: I18nProviderProps) => {
  const t = (key: TranslationKey, values?: Record<string, string | number>) =>
    translate(key, values, locale)

  return createElement(i18nContext.Provider, { value: { locale, t } }, children)
}

export const useI18n = (): I18nContextValue => useContext(i18nContext)
