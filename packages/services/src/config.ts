let baseUrl = "/api"
let habitsBaseUrl = ""
let flagsBaseUrl = "/flags"
let imagesBaseUrl = ""

export const setBaseUrl = (url: string): void => {
  baseUrl = url
}

export const getBaseUrl = (): string => baseUrl

export const setHabitsBaseUrl = (url: string): void => {
  habitsBaseUrl = url
}

export const getHabitsBaseUrl = (): string => habitsBaseUrl

export const setFlagsBaseUrl = (url: string): void => {
  flagsBaseUrl = url
}

export const getFlagsBaseUrl = (): string => flagsBaseUrl

export const setImagesBaseUrl = (url: string): void => {
  imagesBaseUrl = url
}

export const getImagesBaseUrl = (): string => imagesBaseUrl
