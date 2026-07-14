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

export function parseParamValues(searchParams: URLSearchParams, paramKey: string): string[] {
  const raw = searchParams.get(paramKey)
  if (!raw) return []

  return raw.split(",").filter(Boolean)
}

export function toggleParamValue(values: string[], value: string): string[] {
  return values.includes(value)
    ? values.filter((entry) => entry !== value)
    : [...values, value]
}

export function serializeParamValues(values: string[]): string {
  return values.join(",")
}

export function toggleSearchParams(
  searchParams: URLSearchParams,
  paramKey: string,
  value: string,
): URLSearchParams {
  const nextSearchParams = new URLSearchParams(searchParams)
  const nextValues = toggleParamValue(parseParamValues(nextSearchParams, paramKey), value)
  const serialized = serializeParamValues(nextValues)

  if (serialized) {
    nextSearchParams.set(paramKey, serialized)
  } else {
    nextSearchParams.delete(paramKey)
  }

  return nextSearchParams
}
