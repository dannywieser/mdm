import { daysToSeconds } from "mdm-util"

import type {
  FlagDefinition,
  FlagRedisClient,
  ToggleFlagInput,
  ToggleFlagResult,
} from "./flags.types"

const TRUE_VALUE = "true"
const FALSE_VALUE = "false"

export const createFlagRedisKey = ({ id, flag }: ToggleFlagInput): string =>
  `${flag}:${id}`

export const parseFlagValue = (value: string | null): boolean =>
  value === TRUE_VALUE

export const toRedisFlagValue = (value: boolean): string =>
  value ? TRUE_VALUE : FALSE_VALUE

export const getFlag = async (
  redisClient: FlagRedisClient,
  input: ToggleFlagInput,
): Promise<ToggleFlagResult> => {
  const key = createFlagRedisKey(input)
  const currentValue = await redisClient.get(key)

  return {
    ...input,
    value: parseFlagValue(currentValue),
  }
}

export const toggleFlag = async (
  redisClient: FlagRedisClient,
  input: ToggleFlagInput,
  options?: FlagDefinition,
): Promise<ToggleFlagResult> => {
  const key = createFlagRedisKey(input)
  const currentValue = await redisClient.get(key)
  const nextValue = !parseFlagValue(currentValue)
  const redisValue = toRedisFlagValue(nextValue)

  if (typeof options?.expiresInDays === "number") {
    await redisClient.set(key, redisValue, {
      EX: daysToSeconds(options.expiresInDays),
    })
  } else {
    await redisClient.set(key, redisValue)
  }

  return {
    ...input,
    value: nextValue,
  }
}
