import { Box, Wrap } from "@chakra-ui/react"
import { X } from "lucide-react"
import { useSearchParams } from "react-router-dom"

import { useI18n } from "../../i18n"
import { focusRing } from "../../theme/focusRing"
import { toggleSearchParams } from "../NotesFilterFacetGroup/NotesFilterFacetGroup.util"

import type { NotesActiveFiltersProps } from "./NotesActiveFilters.types"
import { buildActiveFilterChips } from "./NotesActiveFilters.util"

export const NotesActiveFilters = ({ selectedFrontmatter, selectedYears }: NotesActiveFiltersProps) => {
  const { t } = useI18n()
  const [, setSearchParams] = useSearchParams()
  const chips = buildActiveFilterChips(selectedYears, selectedFrontmatter)

  if (chips.length === 0) return null

  const handleRemove = (paramKey: string, value: string) => {
    setSearchParams(
      (previousSearchParams) => toggleSearchParams(previousSearchParams, paramKey, value),
      { replace: true },
    )
  }

  return (
    <Wrap gap={2}>
      {chips.map((chip) => (
        <Box
          key={`${chip.paramKey}:${chip.value}`}
          as="button"
          aria-label={t("gallery.removeFilter", { label: chip.label })}
          onClick={() => { handleRemove(chip.paramKey, chip.value); }}
          display="flex"
          alignItems="center"
          gap={1}
          px={3}
          py={1}
          borderWidth="1px"
          borderRadius="full"
          borderColor="app.accent"
          bg="app.accent"
          color="app.background"
          fontSize="sm"
          cursor="pointer"
          transition="opacity 0.15s"
          _hover={{ opacity: 0.85 }}
          {...focusRing}
        >
          {chip.label}
          <X size={12} />
        </Box>
      ))}
    </Wrap>
  )
}
