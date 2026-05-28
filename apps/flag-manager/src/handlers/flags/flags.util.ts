import type {
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

export const toggleFlag = async (
  redisClient: FlagRedisClient,
  input: ToggleFlagInput,
): Promise<ToggleFlagResult> => {
  const key = createFlagRedisKey(input)
  const currentValue = await redisClient.get(key)
  const nextValue = !parseFlagValue(currentValue)

  await redisClient.set(key, toRedisFlagValue(nextValue))

  return {
    ...input,
    value: nextValue,
  }
}
