/**
 * Maps `items` through an async `mapper` while never running more than
 * `limit` mapper calls at once. Useful for large fan-out work such as
 * reading thousands of files, where unbounded `Promise.all` can exhaust
 * OS resources (e.g. open file descriptors).
 *
 * @param items Items to map.
 * @param limit Maximum number of mapper calls in flight at any time.
 * @param mapper Async mapping function receiving the item and its index.
 * @returns Results in the same order as `items`.
 */
export const mapWithConcurrency = async <T, R>(
  items: readonly T[],
  limit: number,
  mapper: (item: T, index: number) => Promise<R>,
): Promise<R[]> => {
  if (limit < 1) {
    throw new Error("mapWithConcurrency limit must be at least 1")
  }

  const results = new Array<R>(items.length)
  let nextIndex = 0

  const worker = async (): Promise<void> => {
    while (nextIndex < items.length) {
      const index = nextIndex
      nextIndex += 1
      results[index] = await mapper(items[index], index)
    }
  }

  const workerCount = Math.min(limit, items.length)
  await Promise.all(Array.from({ length: workerCount }, worker))

  return results
}
