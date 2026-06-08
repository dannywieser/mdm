import { createContext, createElement, type ReactNode, useContext } from "react"

import type { Locale, TranslationKey } from "./i18n.types"

export type { TranslationKey } from "./i18n.types"

const translations: Record<Locale, Record<TranslationKey, string>> = {
  en: {
    "app.name": "mdm",
    "habit.backToHome": "back to home",
    "habit.bestStreak": "best streak",
    "habit.currentStreak": "current streak",
    "habit.currentTrackingWindow": "current tracking window (since {date})",
    "habit.daysLogged": "days logged",
    "habit.entryDate": "date",
    "habit.entryValue": "value",
    "habit.heatLevel": "{count} heat",
    "habit.highestScore": "highest score",
    "habit.modeDoLess": "do less",
    "habit.modeDoMore": "do more",
    "habit.mostDaysLogged": "most days logged",
    "habit.newHigh": "new high!",
    "habit.personalRecords": "personal records",
    "habit.score": "score",
    "habit.scoreEntries": "entries in current score",
    "habit.scoreInfoDoLess": "lower scores are better — staying under the target keeps this habit in check",
    "habit.scoreInfoDoMore": "higher scores are better — aim to beat your target",
    "habit.scoreInfoLabel": "about this score",
    "habit.scoreInfoTarget": "target: {target}",
    "habit.scoreOverTime": "score over time",
    "habit.streak": "streak",
    "habit.totalDays": "total days",
    "home.habits": "habits",
    "home.modifiedToday": "modified today",
    "home.notes": "notes",
    "errors.unableToLoadHabit": "unable to load habit",
    "errors.unableToLoadHabits": "unable to load habits",
    "errors.unableToLoadNotes": "well, that didn't go as planned",
    "errors.unableToLoadReadState": "unable to load read state",
    "errors.unableToLoadStats": "unable to load stats",
    "errors.unableToToggleReadState": "unable to toggle read state",
    "notes.errorTitle": "unable to load notes",
    "notes.header": "notes",
    "notes.linkedNotes": "linked notes",
    "notes.matchedCount": "{count} matched notes",
    "notes.nameColumn": "note title",
    "notes.markAsRead": "mark as read",
    "notes.markAsUnread": "mark as unread",
    "notes.meta": "Vault: {vault} · Directory: {directory}",
    "review.backToHome": "back to home",
    "review.complete": "review complete",
    "review.close": "close",
    "review.forReview": "for review ({count})",
    "palette.catppuccin": "catppuccin",
    "palette.dracula": "dracula",
    "palette.highContrast": "high contrast",
    "palette.gotham": "gotham",
    "palette.gruvbox": "gruvbox",
    "palette.nord": "nord",
    "palette.solarized": "solarized",
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
