/**
 * Maps over items with an async mapper, running at most `concurrency` mapper
 * calls at once. Preserves the input order in the returned results, regardless
 * of the order in which individual mapper calls settle.
 *
 * @param items Items to map over.
 * @param concurrency Maximum number of in-flight mapper calls at any time.
 * @param mapper Async function applied to each item.
 * @returns Mapped results in the same order as `items`.
 */
export const mapWithConcurrency = async <T, R>(
  items: readonly T[],
  concurrency: number,
  mapper: (item: T, index: number) => Promise<R>,
): Promise<R[]> => {
  const results: R[] = new Array<R>(items.length)
  let nextIndex = 0

  const runWorker = async (): Promise<void> => {
    while (nextIndex < items.length) {
      const currentIndex = nextIndex
      nextIndex += 1
      results[currentIndex] = await mapper(items[currentIndex], currentIndex)
    }
  }

  const workerCount = Math.max(1, Math.min(concurrency, items.length))
  await Promise.all(Array.from({ length: workerCount }, () => runWorker()))

  return results
}
