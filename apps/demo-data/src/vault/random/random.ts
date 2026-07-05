import type { RandomGenerator } from "./random.types"

/**
 * Creates a seeded pseudo-random generator (mulberry32) so the demo vault is
 * reproducible for a given seed.
 */
export const createRandom = (seed: number): RandomGenerator => {
  let state = seed >>> 0
  return () => {
    state = (state + 0x6d2b79f5) >>> 0
    let t = state
    t = Math.imul(t ^ (t >>> 15), t | 1)
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61)
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

/** Returns an integer in the inclusive [min, max] range. */
export const randomInt = (
  random: RandomGenerator,
  min: number,
  max: number,
): number => min + Math.floor(random() * (max - min + 1))

/** Picks a single value from a non-empty list. */
export const pickOne = <T>(random: RandomGenerator, values: readonly T[]): T =>
  values[randomInt(random, 0, values.length - 1)]

/** Picks `count` distinct values, preserving the source order. */
export const pickMany = <T>(
  random: RandomGenerator,
  values: readonly T[],
  count: number,
): T[] => {
  const remaining = [...values]
  const picked: T[] = []
  while (picked.length < count && remaining.length > 0) {
    const index = randomInt(random, 0, remaining.length - 1)
    picked.push(...remaining.splice(index, 1))
  }
  return picked
}

/** Returns true with the given probability. */
export const chance = (random: RandomGenerator, probability: number): boolean =>
  random() < probability
