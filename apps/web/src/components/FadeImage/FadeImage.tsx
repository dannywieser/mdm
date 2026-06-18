import { Box, Image, Skeleton } from "@chakra-ui/react"
import { useState } from "react"

import type { FadeImageProps } from "./FadeImage.types"

export const FadeImage = ({
  alt,
  aspectRatio,
  borderRadius,
  maxW,
  minH,
  my,
  objectFit,
  src,
}: FadeImageProps) => {
  const [loadedSrc, setLoadedSrc] = useState<string | undefined>(undefined)
  const loaded = loadedSrc === src
  const onSettled = () => { setLoadedSrc(src); }

  return (
    <Box
      aspectRatio={loaded ? undefined : aspectRatio}
      borderRadius={borderRadius}
      maxW={maxW}
      minH={loaded ? undefined : minH}
      my={my}
      overflow="hidden"
      position="relative"
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
        mx="auto"
        objectFit={objectFit}
        opacity={loaded ? 1 : 0}
        onError={onSettled}
        onLoad={onSettled}
        src={src}
        transition="opacity 0.3s ease-in"
        width={aspectRatio ? "full" : undefined}
      />
    </Box>
  )
}
