import { Box, Flex } from "@chakra-ui/react"

import type { PalettePreviewProps } from "./PalettePreview.types"

function Bar({ w, bg, opacity = 1 }: { w: number; bg: string; opacity?: number }) {
  return <Box h="3px" w={`${w}px`} bg={bg} borderRadius="2px" opacity={opacity} />
}

export function PalettePreview({ paletteName, colors }: PalettePreviewProps) {
  const gradientId = `palette-preview-gradient-${paletteName}`
  const panelProps = {
    bg: colors.panelBackground,
    borderWidth: "1px",
    borderColor: colors.border,
    borderRadius: "4px",
  }

  return (
    <Flex direction="column" gap={1.5} bg={colors.background} borderRadius="md" p={2}>
      {/* Mini card */}
      <Flex justifyContent="space-between" alignItems="center" px={2} py={1.5} {...panelProps}>
        <Flex direction="column" gap={1}>
          <Box h="4px" w="60px" bg={colors.text} borderRadius="2px" opacity={0.85} />
          <Bar w={40} bg={colors.mutedText} opacity={0.6} />
        </Flex>
        <Flex gap={2.5}>
          {[38, 28, 34].map((w, i) => (
            <Flex key={i} direction="column" gap="3px">
              <Bar w={w} bg={colors.mutedText} opacity={0.5} />
              <Box h="5px" w={`${w}px`} bg={i === 1 ? colors.accent : colors.text} borderRadius="2px" opacity={0.8} />
            </Flex>
          ))}
        </Flex>
      </Flex>

      {/* Mini table */}
      <Box {...panelProps} overflow="hidden">
        <Flex gap={3} px={2} py={1} borderBottomWidth="1px" borderBottomColor={colors.border}>
          {[72, 44, 36].map((w, i) => (
            <Bar key={i} w={w} bg={colors.mutedText} opacity={0.5} />
          ))}
        </Flex>
        {[0, 1].map((row) => (
          <Flex
            key={row}
            gap={3}
            px={2}
            py={1}
            borderBottomWidth={row < 1 ? "1px" : 0}
            borderBottomColor={colors.border}
          >
            {[72, 44, 36].map((w, i) => (
              <Bar key={i} w={w} bg={i === 1 ? colors.accent : colors.text} opacity={i === 1 ? 0.85 : 0.7} />
            ))}
          </Flex>
        ))}
      </Box>

      {/* Mini chart */}
      <Box {...panelProps} px={1.5} py={1} overflow="hidden">
        <svg width="100%" height="32" viewBox="0 0 200 32" preserveAspectRatio="none">
          <defs>
            <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={colors.accent} stopOpacity="0.35" />
              <stop offset="100%" stopColor={colors.accent} stopOpacity="0" />
            </linearGradient>
          </defs>
          <path
            d="M0 24 C20 22 35 12 60 14 C85 16 100 8 130 10 C160 12 175 5 200 7"
            fill="none"
            stroke={colors.accent}
            strokeWidth="1.5"
          />
          <path
            d="M0 24 C20 22 35 12 60 14 C85 16 100 8 130 10 C160 12 175 5 200 7 L200 32 L0 32 Z"
            fill={`url(#${gradientId})`}
          />
        </svg>
      </Box>
    </Flex>
  )
}
