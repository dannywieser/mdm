export const YEAR_PARAM_KEY = "year"

export const buildFrontmatterParamKey = (key: string): string => `fm.${key}`

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
