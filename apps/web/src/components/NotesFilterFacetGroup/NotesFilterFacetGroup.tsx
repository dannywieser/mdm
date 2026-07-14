import { Box, Text, Wrap } from "@chakra-ui/react"
import { useSearchParams } from "react-router-dom"

import { focusRing } from "../../theme/focusRing"

import type { NotesFilterFacetGroupProps } from "./NotesFilterFacetGroup.types"
import { parseParamValues, toggleSearchParams } from "./NotesFilterFacetGroup.util"

export const NotesFilterFacetGroup = ({ label, options, paramKey }: NotesFilterFacetGroupProps) => {
  const [searchParams, setSearchParams] = useSearchParams()

  if (options.length === 0) return null

  const selectedValues = parseParamValues(searchParams, paramKey)

  const handleToggle = (value: string) => {
    setSearchParams(
      (previousSearchParams) => toggleSearchParams(previousSearchParams, paramKey, value),
      { replace: true },
    )
  }

  return (
    <Box>
      <Text fontSize="xs" fontWeight="semibold" color="app.textMuted" mb={2} textTransform="uppercase">
        {label}
      </Text>
      <Wrap gap={2}>
        {options.map((value) => {
          const isSelected = selectedValues.includes(value)

          return (
            <Box
              key={value}
              as="button"
              aria-pressed={isSelected}
              onClick={() => { handleToggle(value); }}
              px={3}
              py={1}
              borderWidth="1px"
              borderRadius="full"
              borderColor={isSelected ? "app.accent" : "app.border"}
              bg={isSelected ? "app.accent" : "transparent"}
              color={isSelected ? "app.background" : "app.text"}
              fontSize="sm"
              cursor="pointer"
              transition="border-color 0.15s, background 0.15s, color 0.15s"
              _hover={{ borderColor: "app.accent" }}
              {...focusRing}
            >
              {value}
            </Box>
          )
        })}
      </Wrap>
    </Box>
  )
}
