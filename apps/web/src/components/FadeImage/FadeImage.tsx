import { Box, Image, Skeleton } from "@chakra-ui/react"
import { useState } from "react"

import type { FadeImageProps } from "./FadeImage.types"

export const FadeImage = ({
  alt,
  aspectRatio,
  borderRadius,
  height,
  maxW,
  minH,
  my,
  objectFit,
  src,
  width,
}: FadeImageProps) => {
  // An empty string src would render <img src="">, which browsers treat as a
  // request for the current document URL — omit the attribute entirely instead.
  const resolvedSrc = src === "" ? undefined : src
  const [loadedSrc, setLoadedSrc] = useState<string | undefined>(undefined)
  const loaded = loadedSrc === resolvedSrc
  const onSettled = () => { setLoadedSrc(resolvedSrc); }

  return (
    <Box
      aspectRatio={loaded ? undefined : aspectRatio}
      borderRadius={borderRadius}
      height={height}
      maxW={maxW}
      minH={loaded ? undefined : minH}
      my={my}
      overflow="hidden"
      position="relative"
      width={width}
    >
      {!loaded && (
        <Skeleton
          data-testid="fade-image-skeleton"
          inset={0}
          position="absolute"
        />
      )}
      <Image
        alt={alt}
        display="block"
        height={height}
        mx="auto"
        objectFit={objectFit}
        opacity={loaded ? 1 : 0}
        onError={onSettled}
        onLoad={onSettled}
        src={resolvedSrc}
        transition="opacity 0.3s ease-in"
        width={width ?? (aspectRatio ? "full" : undefined)}
      />
    </Box>
  )
}
