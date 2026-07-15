export const YEAR_PARAM_KEY = "year"

const FRONTMATTER_PARAM_PREFIX = "fm."

export const buildFrontmatterParamKey = (key: string): string => `${FRONTMATTER_PARAM_PREFIX}${key}`

/** Recovers frontmatter keys with an active `fm.<key>` selection from the URL, even ones not present in the current view's facets. */
export function getFrontmatterKeysFromParams(searchParams: URLSearchParams): string[] {
  const keys = new Set<string>()

  for (const paramKey of searchParams.keys()) {
    if (paramKey.startsWith(FRONTMATTER_PARAM_PREFIX)) {
      keys.add(paramKey.slice(FRONTMATTER_PARAM_PREFIX.length))
    }
  }

  return [...keys]
}

/** Collapses a numeric-looking string to its canonical integer form (e.g. "02024" -> "2024") so equivalent year values compare equal; non-numeric values pass through unchanged. */
function normalizeYearValue(value: string): string {
  const numeric = Number(value)
  return Number.isFinite(numeric) ? String(numeric) : value
}

/** Reads a multi-select filter's selections as repeated `paramKey` query params, so an arbitrary value (including one containing a comma) is never ambiguous. */
export function parseParamValues(searchParams: URLSearchParams, paramKey: string): string[] {
  const values = searchParams.getAll(paramKey).map((value) => value.trim()).filter(Boolean)
  const normalized = paramKey === YEAR_PARAM_KEY ? values.map(normalizeYearValue) : values

  return [...new Set(normalized)]
}

export function toggleParamValue(values: string[], value: string): string[] {
  return values.includes(value)
    ? values.filter((entry) => entry !== value)
    : [...values, value]
}

export function toggleSearchParams(
  searchParams: URLSearchParams,
  paramKey: string,
  value: string,
): URLSearchParams {
  const nextSearchParams = new URLSearchParams(searchParams)
  const nextValues = toggleParamValue(parseParamValues(nextSearchParams, paramKey), value)

  nextSearchParams.delete(paramKey)
  for (const nextValue of nextValues) {
    nextSearchParams.append(paramKey, nextValue)
  }

  return nextSearchParams
}
