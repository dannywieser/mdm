import { getDemoDataBasePath } from "./demoMode"

/** Static file for a notes query; slim files omit parsed note content. */
export const buildDemoNotesUrl = (view?: string, includeContent = true): string => {
  const viewSegment = view ? `.${encodeURIComponent(view)}` : ""
  const contentSegment = includeContent ? "" : ".slim"
  return `${getDemoDataBasePath()}/notes${viewSegment}${contentSegment}.json`
}

export const buildDemoViewsUrl = (): string => `${getDemoDataBasePath()}/views.json`

export const buildDemoStatsMetaUrl = (): string =>
  `${getDemoDataBasePath()}/stats.meta.json`

export const buildDemoStatsHistoryUrl = (): string =>
  `${getDemoDataBasePath()}/stats.history.json`

export const buildDemoHabitsUrl = (): string => `${getDemoDataBasePath()}/habits.json`

export const buildDemoHabitUrl = (habitId: string): string =>
  `${getDemoDataBasePath()}/habit.${encodeURIComponent(habitId)}.json`

/** Raw markdown source captured per note id by the demo snapshot. */
export const buildDemoNoteSourceUrl = (noteId: string): string =>
  `${getDemoDataBasePath()}/source/${encodeURIComponent(noteId)}.md`

/** Vault-relative image paths are copied under `<base>/images/` at build time. */
export const buildDemoImageUrl = (path: string): string => {
  const encodedPath = path
    .split("/")
    .map((segment) => encodeURIComponent(segment))
    .join("/")
  return `${getDemoDataBasePath()}/images/${encodedPath}`
}
