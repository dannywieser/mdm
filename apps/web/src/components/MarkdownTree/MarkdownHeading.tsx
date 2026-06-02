import { Heading } from "@chakra-ui/react"

import type { MarkdownHeadingProps } from "./MarkdownHeading.types"

const headingTagByDepth: Record<number, "h1" | "h2" | "h3" | "h4" | "h5" | "h6"> = {
  1: "h1",
  2: "h2",
  3: "h3",
  4: "h4",
  5: "h5",
  6: "h6",
}

const sizeByDepth: Record<number, "2xl" | "xl" | "lg" | "md" | "sm" | "xs"> = {
  1: "2xl",
  2: "xl",
  3: "lg",
  4: "md",
  5: "sm",
  6: "xs",
}

export const MarkdownHeading = ({ children, depth = 1 }: MarkdownHeadingProps) => {
  const safeDepth = Math.min(Math.max(depth, 1), 6)

  return (
    <Heading as={headingTagByDepth[safeDepth]} size={sizeByDepth[safeDepth]} mt="6" mb="3">
      {children}
    </Heading>
  )
}
