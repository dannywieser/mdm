/** Fetches a URL and parses the JSON body, failing loudly on non-2xx responses. */
export const fetchJson = async <T>(url: string): Promise<T> => {
  const response = await fetch(url)

  if (!response.ok) {
    throw new Error(`Request failed with status ${String(response.status)}: ${url}`)
  }

  return (await response.json()) as T
}
