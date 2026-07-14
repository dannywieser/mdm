const EXTERNAL_URL_PATTERN = /^(?:[a-zA-Z][a-zA-Z\d+.-]*:|\/\/|#)/

/**
 * Checks whether a path/reference is an external URL (has a URL scheme, is
 * protocol-relative, or is a fragment) rather than a path local to the vault.
 *
 * @param value Candidate path or URL.
 * @returns True when the value should be treated as external and left unresolved.
 */
export const isExternalUrl = (value: string): boolean => EXTERNAL_URL_PATTERN.test(value)
