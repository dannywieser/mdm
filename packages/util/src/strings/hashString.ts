/**
 * Hashes a string into a stable, non-negative 32-bit integer (FNV-1a).
 *
 * Useful for deriving deterministic pseudo-random values (offsets, rotations,
 * colors) from an identifier, so the same input always produces the same
 * result across renders and reloads. Not suitable for cryptographic use.
 *
 * @param value String to hash.
 * @returns Non-negative integer in the range 0 to 2^32 - 1.
 */
export const hashString = (value: string): number => {
  let hash = 2166136261

  for (let index = 0; index < value.length; index += 1) {
    hash ^= value.charCodeAt(index)
    hash = Math.imul(hash, 16777619)
  }

  return hash >>> 0
}
