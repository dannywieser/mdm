/**
 * Converts unknown error values into log-safe structured data.
 *
 * @param error Unknown caught error value.
 * @returns Serializable error payload preserving message and stack when possible.
 */
export const toLoggableError = (error: unknown): unknown =>
  error instanceof Error
    ? { message: error.message, stack: error.stack }
    : error
