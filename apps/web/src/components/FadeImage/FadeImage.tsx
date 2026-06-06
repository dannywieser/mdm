import { Box, Image, Skeleton } from "@chakra-ui/react"
import { useState } from "react"

import type { FadeImageProps } from "./FadeImage.types"

export const FadeImage = ({
  alt,
  aspectRatio,
  borderRadius,
  display,
  maxW,
  minH,
  my,
  mx,
  objectFit,
  src,
}: FadeImageProps) => {
  const [loaded, setLoaded] = useState(false)

  return (
    <Box
      aspectRatio={aspectRatio}
      borderRadius={borderRadius}
      display={display}
      maxW={maxW}
      minH={loaded ? undefined : minH}
      my={my}
      mx={mx}
      overflow="hidden"
      position="relative"
    >
      {!loaded && (
        <Skeleton
          data-testid="fade-image-skeleton"
          height="full"
          position="absolute"
          width="full"
        />
      )}
      <Image
        alt={alt}
        objectFit={objectFit}
        opacity={loaded ? 1 : 0}
        onLoad={() => setLoaded(true)}
        src={src}
        transition="opacity 0.3s ease-in"
        width="full"
      />
    </Box>
  )
}
