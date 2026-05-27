import { getObjectValue } from "./getObjectValue"

/**
 * Resolves a dot-notated path from an unknown root value.
 *
 * @param value Root value to traverse.
 * @param valuePath Dot-notated path (for example: `frontmatter.topic`).
 * @returns Resolved nested value or undefined when any segment is missing.
 */
export const getValueByPath = (value: unknown, valuePath: string): unknown =>
  valuePath
    .split(".")
    .filter((segment) => segment.length > 0)
    .reduce<unknown>((currentValue, segment) => getObjectValue(currentValue, segment), value)
