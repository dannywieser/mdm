import { Box, Input } from "@chakra-ui/react"
import { Search, X } from "lucide-react"
import { useEffect, useRef, useState } from "react"
import { useSearchParams } from "react-router-dom"

import { useI18n } from "../../i18n"
import { focusRing } from "../../theme/focusRing"

import { SEARCH_PARAM_KEY, SEARCH_DEBOUNCE_MS } from "./NotesSearchInput.constants"

export function NotesSearchInput() {
  const { t } = useI18n()
  const [searchParams, setSearchParams] = useSearchParams()
  const searchParamValue = searchParams.get(SEARCH_PARAM_KEY) ?? ""
  const [value, setValue] = useState(searchParamValue)
  const [syncedSearchParamValue, setSyncedSearchParamValue] = useState(searchParamValue)
  const debounceTimeoutRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined)

  if (searchParamValue !== syncedSearchParamValue) {
    setSyncedSearchParamValue(searchParamValue)
    setValue(searchParamValue)
  }

  useEffect(() => {
    return () => { clearTimeout(debounceTimeoutRef.current); }
  }, [])

  const setSearchParamValue = (nextValue: string) => {
    setSearchParams(
      (previousSearchParams) => {
        const nextSearchParams = new URLSearchParams(previousSearchParams)

        if (nextValue) {
          nextSearchParams.set(SEARCH_PARAM_KEY, nextValue)
        } else {
          nextSearchParams.delete(SEARCH_PARAM_KEY)
        }

        return nextSearchParams
      },
      { replace: true },
    )
  }

  const handleChange = (nextValue: string) => {
    setValue(nextValue)
    clearTimeout(debounceTimeoutRef.current)

    debounceTimeoutRef.current = setTimeout(() => {
      setSearchParamValue(nextValue)
    }, SEARCH_DEBOUNCE_MS)
  }

  const handleClear = () => {
    clearTimeout(debounceTimeoutRef.current)
    setValue("")
    setSearchParamValue("")
  }

  return (
    <Box position="relative" flex="1" mx={2}>
      <Box
        position="absolute"
        left={2}
        top="50%"
        transform="translateY(-50%)"
        color="app.textMuted"
        pointerEvents="none"
        display="flex"
      >
        <Search size={16} />
      </Box>
      <Input
        aria-label={t("header.searchNotes")}
        placeholder={t("header.searchNotes")}
        value={value}
        onChange={(event) => { handleChange(event.target.value); }}
        size="sm"
        ps={8}
        pe={value ? 8 : undefined}
        borderColor="app.border"
        _hover={{ borderColor: "app.borderHover" }}
        _focus={{ borderColor: "app.accent" }}
        _focusVisible={{ borderColor: "app.accent" }}
      />
      {value && (
        <Box
          as="button"
          aria-label={t("gallery.clearSearch")}
          onClick={handleClear}
          position="absolute"
          right={2}
          top="50%"
          transform="translateY(-50%)"
          color="app.textMuted"
          display="flex"
          cursor="pointer"
          _hover={{ color: "app.text" }}
          {...focusRing}
        >
          <X size={14} />
        </Box>
      )}
    </Box>
  )
}
