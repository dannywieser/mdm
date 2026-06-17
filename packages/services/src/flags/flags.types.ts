export interface ToggleFlagInput {
  id: string
  flag: string
}

export type ToggleFlagResult = ToggleFlagInput & {
  value: boolean
}
