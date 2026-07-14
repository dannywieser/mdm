const HTTP_URL_PATTERN = /^(?:https?:|\/\/)/i

/**
 * Checks whether a value is an http(s) URL or a protocol-relative URL — the
 * only external URL forms that are safe to render directly (e.g. as an
 * `<img src>`) without risking an unexpected scheme like `javascript:` or
 * `data:` reaching the DOM.
 *
 * @param value Candidate path or URL.
 * @returns True when the value is an http(s) or protocol-relative URL.
 */
export const isHttpUrl = (value: string): boolean => HTTP_URL_PATTERN.test(value)
