export const toLoggableError = (error: unknown): unknown =>
  error instanceof Error
    ? { message: error.message, stack: error.stack }
    : error
